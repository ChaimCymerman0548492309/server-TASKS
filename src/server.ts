import express, { Request, Response } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// חיבור ל-MongoDB
const mongoURI = 'mongodb+srv://CHAIMCY1:8114@cluster0.waypb.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions)
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
// const db = mongoose.connection;

// db.on('error', (error) => {
//   console.error('❌ Connection error to MongoDB:', error);
// });

// db.once('open', () => {
//   console.log('✅ Successfully connected to MongoDB!');
// });

// הגדרת סכמה עבור User
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String },
});

const User = mongoose.model<IUser>('User', userSchema);

// הגדרת סכמה עבור Mood
interface IMood extends Document {
  userId: string;
  mood: string;
  time: string;
}

const moodSchema = new Schema<IMood>({
  userId: { type: String, required: true },
  mood: { type: String, required: true },
  time: { type: String, required: true },
});

const Mood = mongoose.model<IMood>('Mood', moodSchema);

// API
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });
  await user.save();
  res.status(201).json(user);
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/moods', async (req: Request, res: Response) => {
  const { userId, mood } = req.body;
  const newMood = new Mood({ userId, mood, time: new Date().toISOString() });
  await newMood.save();
  res.status(201).json(newMood);
});

app.get('/api/moods/:userId', async (req: Request, res: Response) => {
  const moods = await Mood.find({ userId: req.params.userId });
  
  res.json(moods);
});

app.post('/api/moods', async (req: Request, res: Response) => {
  const { userId, mood } = req.body;
  console.log(req.body);
  
  const newMood = new Mood({ userId, mood, time: new Date().toISOString() });
  await newMood.save();
  res.status(201).json(newMood);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running  Successfully on http://localhost:${PORT}`);
});




