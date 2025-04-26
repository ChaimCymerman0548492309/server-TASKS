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
// import { Request, Response, NextFunction, RequestHandler } from 'express';
const mongoose_1 = __importStar(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://CHAIMCY1:8114@cluster0.waypb.mongodb.net/calendar-app?retryWrites=true&w=majority&appName=Cluster0';
mongoose_1.default.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Successfully connected to MongoDB!'))
    .catch(error => console.error('❌ Connection error:', error));
const userSchema = new mongoose_1.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose_1.default.model('User', userSchema);
const eventSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    color: { type: String },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
});
const Event = mongoose_1.default.model('Event', eventSchema);
// Authentication middleware
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            throw new Error('Authentication required');
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield User.findOne({ _id: decoded._id });
        if (!user)
            throw new Error('User not found');
        req.token = token;
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).send({ message: 'Please authenticate' });
    }
});
// Route handlers with proper typing - using RequestHandler type
const registerHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ message: 'Username and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).send({ message: 'Password must be at least 6 characters' });
        }
        const existingUser = yield User.findOne({ username });
        if (existingUser) {
            return res.status(400).send({ message: 'Username already exists' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, JWT_SECRET);
        res.status(201).send({ user, token });
    }
    catch (error) {
        res.status(500).send({ message: 'Error registering user' });
    }
});
const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ message: 'Username and password are required' });
        }
        const user = yield User.findOne({ username });
        if (!user) {
            return res.status(400).send({ message: 'Invalid credentials' });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, JWT_SECRET);
        res.send({ user, token });
    }
    catch (error) {
        res.status(500).send({ message: 'Error logging in' });
    }
});
const getMeHandler = (req, res) => {
    res.send(req.user);
};
const getEventsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const events = yield Event.find({ user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        res.send(events);
    }
    catch (error) {
        res.status(500).send({ message: 'Error fetching events' });
    }
});
const createEventHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const event = new Event(Object.assign(Object.assign({}, req.body), { user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }));
        yield event.save();
        res.status(201).send(event);
    }
    catch (error) {
        res.status(500).send({ message: 'Error creating event' });
    }
});
const updateEventHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const event = yield Event.findOneAndUpdate({ _id: req.params.id, user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }, req.body, { new: true });
        if (!event) {
            return res.status(404).send({ message: 'Event not found' });
        }
        res.send(event);
    }
    catch (error) {
        res.status(500).send({ message: 'Error updating event' });
    }
});
const deleteEventHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const event = yield Event.findOneAndDelete({
            _id: req.params.id,
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        if (!event) {
            return res.status(404).send({ message: 'Event not found' });
        }
        res.send(event);
    }
    catch (error) {
        res.status(500).send({ message: 'Error deleting event' });
    }
});
// Register routes
app.post('/api/auth/register', registerHandler);
app.post('/api/auth/login', loginHandler);
app.get('/api/auth/me', authenticate, getMeHandler);
app.get('/api/events', authenticate, getEventsHandler);
app.post('/api/events', authenticate, createEventHandler);
app.put('/api/events/:id', authenticate, updateEventHandler);
app.delete('/api/events/:id', authenticate, deleteEventHandler);
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
