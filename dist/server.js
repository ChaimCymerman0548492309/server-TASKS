"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importStar(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 5000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// חיבור ל-MongoDB
const mongoURI = 'mongodb+srv://CHAIMCY1:8114@cluster0.waypb.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0';
mongoose_1.default.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
})
    .catch((error) => {
    console.error('❌ Connection error to MongoDB:', error);
    // הדפס את ה-cause של השגיאה
    if (error.cause) {
        console.error('Cause of the error:', error.cause);
    }
    // הדפס את ה-stack trace המלא
    console.error('Stack trace:', error.stack);
});
// // בדיקת התחברות ל-MongoDB
const db = mongoose_1.default.connection;
db.on('error', (error) => {
    console.error('❌ Connection error to MongoDB:', error);
});
db.once('open', () => {
    console.log('✅ Successfully connected to MongoDB!');
});
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String },
});
const User = mongoose_1.default.model('User', userSchema);
const moodSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    mood: { type: String, required: true },
    time: { type: String, required: true },
});
const Mood = mongoose_1.default.model('Mood', moodSchema);
// API
app.post('/api/auth/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    yield user.save();
    res.status(201).json(user);
}));
app.post('/api/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield User.findOne({ email, password });
    if (user) {
        res.json(user);
    }
    else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
}));
app.post('/api/moods', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, mood } = req.body;
    const newMood = new Mood({ userId, mood, time: new Date().toISOString() });
    yield newMood.save();
    res.status(201).json(newMood);
}));
app.get('/api/moods/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const moods = yield Mood.find({ userId: req.params.userId });
    res.json(moods);
}));
app.post('/api/moods', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, mood } = req.body;
    console.log(req.body);
    const newMood = new Mood({ userId, mood, time: new Date().toISOString() });
    yield newMood.save();
    res.status(201).json(newMood);
}));
app.listen(PORT, () => {
    console.log(`✅ Server is running  Successfully on http://localhost:${PORT}`);
});
