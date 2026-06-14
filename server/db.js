import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: "../.env" }); // Load from root env

// Disable buffering so that calls fail fast when disconnected, routing to JSON fallback
mongoose.set("bufferCommands", false);

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/aace";

// Set a short timeout (3s) so startup fails fast if database is unreachable
export const dbReady = mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 5000,
})
  .then(() => {
    console.log("Connected to MongoDB successfully.");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err.message.split("\n")[0]);
    console.log("AACE Platform is automatically falling back to Local JSON database file.");
  });

// 1. Candidate Schema
const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  empId: { type: String, required: true, unique: true },
  stage: { type: String, default: "Onboarding Stage" },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now }
});

// 2. ChatLog Schema
const ChatLogSchema = new mongoose.Schema({
  portal: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 3. Memory Schema
const MemorySchema = new mongoose.Schema({
  text: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// 4. Employee Schema
const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  dept: { type: String, required: true },
  empId: { type: String, required: true, unique: true },
  passcode: { type: String, default: "employee" },
  type: { type: String, default: "Full-Time" },
  createdAt: { type: Date, default: Date.now }
});

// 5. Attendance Schema
const AttendanceSchema = new mongoose.Schema({
  empId: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, default: "Present" },
  loginTime: { type: Date, default: Date.now }
});

const MongoCandidate = mongoose.model("Candidate", CandidateSchema);
const MongoChatLog = mongoose.model("ChatLog", ChatLogSchema);
const MongoMemory = mongoose.model("Memory", MemorySchema);
const MongoEmployee = mongoose.model("Employee", EmployeeSchema);
const MongoAttendance = mongoose.model("Attendance", AttendanceSchema);

// --- HYBRID DATABASE FALLBACK SYSTEM ---
const FALLBACK_FILE = path.join(process.cwd(), "db_fallback.json");

function readFallbackDb() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      return JSON.parse(fs.readFileSync(FALLBACK_FILE, "utf8"));
    }
  } catch (err) {
    console.error("Error reading JSON fallback DB:", err);
  }
  return {
    candidates: [],
    chatlogs: [],
    memories: [],
    employees: [],
    attendances: []
  };
}

function writeFallbackDb(data) {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing JSON fallback DB:", err);
  }
}

class JsonDocument {
  constructor(collectionName, data) {
    this._collection = collectionName;
    Object.assign(this, data);
    if (!this._id && !this.id) {
      this._id = Math.random().toString(36).substring(2, 9);
    }
    if (!this.createdAt && !this.loginTime) {
      this.createdAt = new Date();
    }
  }

  async save() {
    const db = readFallbackDb();
    const list = db[this._collection] || [];
    
    // Check if document already exists (by _id or empId or text)
    let idx = -1;
    if (this._collection === 'employees' && this.empId) {
      idx = list.findIndex(item => item.empId === this.empId);
    } else if (this._collection === 'memories' && this.text) {
      idx = list.findIndex(item => item.text === this.text);
    } else if (this._collection === 'candidates' && this.empId) {
      idx = list.findIndex(item => item.empId === this.empId);
    } else {
      idx = list.findIndex(item => item._id === this._id);
    }

    // Strip internal fields starting with _ before saving
    const cleanData = {};
    Object.keys(this).forEach(k => {
      if (!k.startsWith('_')) {
        cleanData[k] = this[k];
      }
    });
    cleanData._id = this._id;

    if (idx !== -1) {
      list[idx] = cleanData;
    } else {
      list.push(cleanData);
    }

    db[this._collection] = list;
    writeFallbackDb(db);
    return this;
  }
}

class HybridModel {
  constructor(modelName, collectionName, mongooseModel) {
    this.modelName = modelName;
    this.collectionName = collectionName;
    this.mongooseModel = mongooseModel;
  }

  isMongoConnected() {
    return mongoose.connection.readyState === 1;
  }

  wrapDoc(data) {
    if (!data) return null;
    if (Array.isArray(data)) {
      return data.map(item => new JsonDocument(this.collectionName, item));
    }
    return new JsonDocument(this.collectionName, data);
  }

  find(query = {}) {
    const queryBuilder = {
      _sort: null,
      _limit: null,
      sort: function(sortObj) {
        this._sort = sortObj;
        return this;
      },
      limit: function(num) {
        this._limit = num;
        return this;
      },
      then: async (resolve, reject) => {
        if (this.isMongoConnected()) {
          try {
            let mQuery = this.mongooseModel.find(query);
            if (this._sort) mQuery = mQuery.sort(this._sort);
            if (this._limit) mQuery = mQuery.limit(this._limit);
            const res = await mQuery;
            resolve(res);
          } catch (e) {
            reject(e);
          }
        } else {
          const db = readFallbackDb();
          let list = db[this.collectionName] || [];
          
          // Simple query filtering support
          if (query.portal) {
            list = list.filter(item => item.portal === query.portal);
          }
          if (query.empId) {
            list = list.filter(item => item.empId === query.empId);
          }
          if (query.loginTime && typeof query.loginTime === 'object') {
            const timeVal = query.loginTime;
            list = list.filter(item => {
              const itemTime = new Date(item.loginTime).getTime();
              const gte = timeVal.$gte ? new Date(timeVal.$gte).getTime() : -Infinity;
              const lte = timeVal.$lte ? new Date(timeVal.$lte).getTime() : Infinity;
              return itemTime >= gte && itemTime <= lte;
            });
          }

          // Apply sorting
          if (this._sort) {
            const sortKey = Object.keys(this._sort)[0];
            const sortOrder = this._sort[sortKey];
            list = list.sort((a, b) => {
              const valA = a[sortKey] instanceof Date ? new Date(a[sortKey]) : a[sortKey];
              const valB = b[sortKey] instanceof Date ? new Date(b[sortKey]) : b[sortKey];
              if (valA < valB) return -sortOrder;
              if (valA > valB) return sortOrder;
              return 0;
            });
          }

          // Apply limit
          if (this._limit) {
            list = list.slice(0, this._limit);
          }

          resolve(this.wrapDoc(list));
        }
      }
    };

    return queryBuilder;
  }

  async findOne(query = {}) {
    if (this.isMongoConnected()) {
      try {
        return await this.mongooseModel.findOne(query);
      } catch (e) {
        console.warn("MongoDB connection failed mid-flight, using local fallback.");
      }
    }
    
    const db = readFallbackDb();
    const list = db[this.collectionName] || [];
    
    const found = list.find(item => {
      return Object.keys(query).every(key => {
        const val = query[key];
        if (val instanceof RegExp) {
          return val.test(item[key]);
        }
        if (val && typeof val === 'object') {
          if (val.$gte || val.$lte) {
            const itemTime = new Date(item[key]).getTime();
            const gte = val.$gte ? new Date(val.$gte).getTime() : -Infinity;
            const lte = val.$lte ? new Date(val.$lte).getTime() : Infinity;
            return itemTime >= gte && itemTime <= lte;
          }
        }
        return item[key] === val;
      });
    });
    return this.wrapDoc(found);
  }

  async deleteOne(query = {}) {
    if (this.isMongoConnected()) {
      try {
        return await this.mongooseModel.deleteOne(query);
      } catch (e) {
        console.warn("MongoDB delete failed mid-flight, using local fallback.");
      }
    }
    
    const db = readFallbackDb();
    let list = db[this.collectionName] || [];
    const beforeLen = list.length;
    
    list = list.filter(item => {
      return !Object.keys(query).every(key => item[key] === query[key]);
    });
    
    db[this.collectionName] = list;
    writeFallbackDb(db);
    return { deletedCount: beforeLen - list.length };
  }
}

function createHybridModel(modelName, collectionName, mongooseModel) {
  const hybrid = new HybridModel(modelName, collectionName, mongooseModel);
  
  const ModelConstructor = function(data) {
    if (hybrid.isMongoConnected()) {
      return new mongooseModel(data);
    } else {
      return new JsonDocument(collectionName, data);
    }
  };

  ModelConstructor.find = (q) => hybrid.find(q);
  ModelConstructor.findOne = (q) => hybrid.findOne(q);
  ModelConstructor.deleteOne = (q) => hybrid.deleteOne(q);
  
  return ModelConstructor;
}

export const Candidate = createHybridModel("Candidate", "candidates", MongoCandidate);
export const ChatLog = createHybridModel("ChatLog", "chatlogs", MongoChatLog);
export const Memory = createHybridModel("Memory", "memories", MongoMemory);
export const Employee = createHybridModel("Employee", "employees", MongoEmployee);
export const Attendance = createHybridModel("Attendance", "attendances", MongoAttendance);

export default mongoose;