import express , { Request, Response, NextFunction, RequestHandler, request }from 'express';
// import { Request, Response, NextFunction, RequestHandler } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend the Request interface to include our custom properties
interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://CHAIMCY1:8114@cluster0.waypb.mongodb.net/calendar-app?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions)
  .then(() => console.log('✅ Successfully connected to MongoDB!'))
  .catch(error => console.error('❌ Connection error:', error));

// User model
interface IUser extends Document {
  username: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model<IUser>('User', userSchema);

// Event model
interface IEvent extends Document {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  user: Schema.Types.ObjectId;
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  allDay: { type: Boolean, default: false },
  color: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

const Event = mongoose.model<IEvent>('Event', eventSchema);

// Authentication middleware
const authenticate: RequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Authentication required');
    
    const decoded = jwt.verify(token, JWT_SECRET) as { _id: string };
    const user = await User.findOne({ _id: decoded._id });
    
    if (!user) throw new Error('User not found');
    
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Please authenticate' });
  }
};

// Route handlers with proper typing - using RequestHandler type
const registerHandler = async (req : Request , res : any) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ message: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).send({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(500).send({ message: 'Error registering user' });
  }
};

const loginHandler = async (req : Request, res : any) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(500).send({ message: 'Error logging in' });
  }
};

const getMeHandler: RequestHandler = (req: AuthenticatedRequest, res) => {
  res.send(req.user);
};

const getEventsHandler: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const events = await Event.find({ user: req.user?._id });
    res.send(events);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching events' });
  }
};

const createEventHandler: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const event = new Event({
      ...req.body,
      user: req.user?._id
    });
    await event.save();
    res.status(201).send(event);
  } catch (error) {
    res.status(500).send({ message: 'Error creating event' });
  }
};

const updateEventHandler = async (req: AuthenticatedRequest, res : any) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      req.body,
      { new: true }
    );

    if (!event) {
      return res.status(404).send({ message: 'Event not found' });
    }

    res.send(event);
  } catch (error) {
    res.status(500).send({ message: 'Error updating event' });
  }
};

const deleteEventHandler = async (req: AuthenticatedRequest, res : any) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.user?._id
    });

    if (!event) {
      return res.status(404).send({ message: 'Event not found' });
    }

    res.send(event);
  } catch (error) {
    res.status(500).send({ message: 'Error deleting event' });
  }
};

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