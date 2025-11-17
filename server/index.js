const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    const prodOrigins = [
      "https://your-app.netlify.app",
      "https://your-app.vercel.app",
      "https://your-custom-domain.com"
    ];
    
    if (process.env.ALLOW_LOCALHOST === 'true') {
      prodOrigins.push("http://localhost:3000", "http://localhost:19006");
    }
    
    return prodOrigins;
  }
  
  return ["http://localhost:3000", "http://localhost:19006"];
};

const io = socketIo(server, {
  cors: {
    origin: getAllowedOrigins(),
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// Enhanced game state management
const gameRooms = new Map();
const players = new Map();
const availableRooms = new Map(); // For room discovery

// Game modes configuration
const GAME_MODES = {
  CLASSIC: {
    name: "Classic Battle",
    maxPlayers: 4,
    timerDuration: 5,
    description: "Standard quiz battle with 5-second questions"
  },
  RAPID: {
    name: "Rapid Fire",
    maxPlayers: 4,
    timerDuration: 3,
    description: "Fast-paced 3-second questions"
  },
  SURVIVAL: {
    name: "Survival Mode",
    maxPlayers: 4,
    timerDuration: 5,
    description: "No health system - elimination style"
  }
};

// Enhanced Question categories configuration
const CATEGORIES = {
  GEOGRAPHY: {
    name: "Geography",
    icon: "🌍",
    color: "#4CAF50",
    description: "Countries, capitals, landmarks, and world geography"
  },
  SCIENCE: {
    name: "Science",
    icon: "🔬",
    color: "#2196F3",
    description: "Biology, chemistry, physics, and scientific concepts"
  },
  HISTORY: {
    name: "History",
    icon: "📜",
    color: "#FF9800",
    description: "Ancient civilizations to modern history"
  },
  SPORTS: {
    name: "Sports",
    icon: "⚽",
    color: "#9C27B0",
    description: "Football, basketball, Olympics, and sports trivia"
  },
  ENTERTAINMENT: {
    name: "Entertainment",
    icon: "🎬",
    color: "#E91E63",
    description: "Movies, TV shows, music, and celebrity trivia"
  },
  TECHNOLOGY: {
    name: "Technology",
    icon: "💻",
    color: "#607D8B",
    description: "Computers, internet, tech companies, and innovations"
  },
  LITERATURE: {
    name: "Literature",
    icon: "📚",
    color: "#795548",
    description: "Classic books, authors, and literary works"
  },
  MUSIC: {
    name: "Music",
    icon: "🎵",
    color: "#FF5722",
    description: "Rock, pop, classical music, and music history"
  },
  MOVIES: {
    name: "Movies",
    icon: "🎭",
    color: "#3F51B5",
    description: "Hollywood cinema, directors, and film trivia"
  },
  MATHEMATICS: {
    name: "Mathematics",
    icon: "🧮",
    color: "#009688",
    description: "Algebra, geometry, calculus, and math concepts"
  },
  ANIMALS: {
    name: "Animals & Nature",
    icon: "🐾",
    color: "#8D6E63",
    description: "Wildlife, pets, marine life, and nature facts"
  },
  FOOD: {
    name: "Food & Cooking",
    icon: "🍳",
    color: "#FF8A65",
    description: "Cuisines, ingredients, cooking, and food culture"
  },
  ART: {
    name: "Art & Culture",
    icon: "🎨",
    color: "#BA68C8",
    description: "Fine arts, paintings, sculptures, and cultural topics"
  },
  BUSINESS: {
    name: "Business & Economics",
    icon: "💼",
    color: "#4DB6AC",
    description: "Finance, economics, companies, and business concepts"
  },
  HEALTH: {
    name: "Health & Medicine",
    icon: "🏥",
    color: "#F06292",
    description: "Anatomy, diseases, medicine, and health facts"
  },
  SPACE: {
    name: "Space & Astronomy",
    icon: "🚀",
    color: "#7E57C2",
    description: "Planets, stars, space exploration, and astronomy"
  },
  GENERAL: {
    name: "General Knowledge",
    icon: "🧠",
    color: "#8BC34A",
    description: "Mixed topics - test your overall knowledge!"
  }
};

// Expanded Question Database by Category
const questions = {
  GEOGRAPHY: [
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: 2,
      category: "Geography"
    },
    {
      id: 2,
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Pacific", "Arctic"],
      correct: 2,
      category: "Geography"
    },
    {
      id: 3,
      question: "Which country has the most natural lakes?",
      options: ["USA", "Canada", "Russia", "Finland"],
      correct: 1,
      category: "Geography"
    },
    {
      id: 4,
      question: "What is the smallest country in the world?",
      options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
      correct: 2,
      category: "Geography"
    },
    {
      id: 5,
      question: "Which mountain range contains Mount Everest?",
      options: ["Andes", "Rockies", "Himalayas", "Alps"],
      correct: 2,
      category: "Geography"
    }
  ],
  SCIENCE: [
    {
      id: 6,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1,
      category: "Science"
    },
    {
      id: 7,
      question: "What is the chemical symbol for gold?",
      options: ["Go", "Gd", "Au", "Ag"],
      correct: 2,
      category: "Science"
    },
    {
      id: 8,
      question: "How many bones are in the adult human body?",
      options: ["186", "206", "226", "246"],
      correct: 1,
      category: "Science"
    },
    {
      id: 9,
      question: "What is the speed of light in vacuum?",
      options: ["299,792,458 m/s", "300,000,000 m/s", "186,000 m/s", "3,000,000 m/s"],
      correct: 0,
      category: "Science"
    },
    {
      id: 10,
      question: "Which gas do plants absorb from the atmosphere?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
      correct: 2,
      category: "Science"
    }
  ],
  HISTORY: [
    {
      id: 11,
      question: "In which year did World War II end?",
      options: ["1942", "1945", "1948", "1950"],
      correct: 1,
      category: "History"
    },
    {
      id: 12,
      question: "Who was the first President of the United States?",
      options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"],
      correct: 1,
      category: "History"
    },
    {
      id: 13,
      question: "The Berlin Wall fell in which year?",
      options: ["1987", "1989", "1991", "1993"],
      correct: 1,
      category: "History"
    },
    {
      id: 14,
      question: "Which ancient wonder of the world was located in Alexandria?",
      options: ["Hanging Gardens", "Lighthouse", "Colossus", "Pyramids"],
      correct: 1,
      category: "History"
    },
    {
      id: 15,
      question: "Who painted the famous work 'The Last Supper'?",
      options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"],
      correct: 1,
      category: "History"
    }
  ],
  SPORTS: [
    {
      id: 16,
      question: "How many players are on a basketball team on court?",
      options: ["4", "5", "6", "7"],
      correct: 1,
      category: "Sports"
    },
    {
      id: 17,
      question: "Which country has won the most FIFA World Cups?",
      options: ["Germany", "Italy", "Brazil", "Argentina"],
      correct: 2,
      category: "Sports"
    },
    {
      id: 18,
      question: "What is the length of an Olympic swimming pool?",
      options: ["25 meters", "50 meters", "75 meters", "100 meters"],
      correct: 1,
      category: "Sports"
    },
    {
      id: 19,
      question: "In tennis, what term means zero points?",
      options: ["Zero", "Love", "Nil", "Blank"],
      correct: 1,
      category: "Sports"
    },
    {
      id: 20,
      question: "Which sport uses the term 'birdie'?",
      options: ["Tennis", "Golf", "Badminton", "Table Tennis"],
      correct: 1,
      category: "Sports"
    }
  ],
  ENTERTAINMENT: [
    {
      id: 21,
      question: "Who directed the movie 'Titanic'?",
      options: ["Steven Spielberg", "James Cameron", "Martin Scorsese", "Christopher Nolan"],
      correct: 1,
      category: "Entertainment"
    },
    {
      id: 22,
      question: "Which movie features the song 'My Heart Will Go On'?",
      options: ["Ghost", "Titanic", "The Bodyguard", "Dirty Dancing"],
      correct: 1,
      category: "Entertainment"
    },
    {
      id: 23,
      question: "Who played Iron Man in the Marvel movies?",
      options: ["Chris Evans", "Chris Hemsworth", "Robert Downey Jr.", "Mark Ruffalo"],
      correct: 2,
      category: "Entertainment"
    },
    {
      id: 24,
      question: "Which TV show features the character Walter White?",
      options: ["The Sopranos", "Breaking Bad", "Better Call Saul", "Narcos"],
      correct: 1,
      category: "Entertainment"
    },
    {
      id: 25,
      question: "Who wrote the 'Harry Potter' book series?",
      options: ["J.R.R. Tolkien", "J.K. Rowling", "Stephen King", "George R.R. Martin"],
      correct: 1,
      category: "Entertainment"
    }
  ],
  TECHNOLOGY: [
    {
      id: 26,
      question: "What does 'WWW' stand for?",
      options: ["World Wide Web", "World Wide Website", "World Web Wide", "Website World Wide"],
      correct: 0,
      category: "Technology"
    },
    {
      id: 27,
      question: "Who is the co-founder of Microsoft?",
      options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Larry Page"],
      correct: 1,
      category: "Technology"
    },
    {
      id: 28,
      question: "What is the binary representation of the decimal number 5?",
      options: ["100", "101", "110", "111"],
      correct: 1,
      category: "Technology"
    },
    {
      id: 29,
      question: "Which programming language is known as the 'language of the web'?",
      options: ["Java", "Python", "JavaScript", "C++"],
      correct: 2,
      category: "Technology"
    },
    {
      id: 30,
      question: "What does 'AI' stand for in technology?",
      options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Intelligence", "Applied Intelligence"],
      correct: 1,
      category: "Technology"
    }
  ],
  LITERATURE: [
    {
      id: 31,
      question: "Who wrote 'Pride and Prejudice'?",
      options: ["Charlotte Brontë", "Jane Austen", "Emily Dickinson", "Mary Shelley"],
      correct: 1,
      category: "Literature"
    },
    {
      id: 32,
      question: "Which book begins with 'Call me Ishmael'?",
      options: ["Moby Dick", "1984", "The Great Gatsby", "To Kill a Mockingbird"],
      correct: 0,
      category: "Literature"
    },
    {
      id: 33,
      question: "Who wrote 'The Lord of the Rings' trilogy?",
      options: ["C.S. Lewis", "J.R.R. Tolkien", "Philip Pullman", "J.K. Rowling"],
      correct: 1,
      category: "Literature"
    },
    {
      id: 34,
      question: "Which play features the character Hamlet?",
      options: ["King Lear", "Macbeth", "Hamlet", "Romeo and Juliet"],
      correct: 2,
      category: "Literature"
    },
    {
      id: 35,
      question: "Who wrote 'Catcher in the Rye'?",
      options: ["John Steinbeck", "J.D. Salinger", "Ernest Hemingway", "F. Scott Fitzgerald"],
      correct: 1,
      category: "Literature"
    }
  ],
  MUSIC: [
    {
      id: 36,
      question: "Who is known as the 'King of Pop'?",
      options: ["Prince", "Michael Jackson", "Justin Timberlake", "Madonna"],
      correct: 1,
      category: "Music"
    },
    {
      id: 37,
      question: "Which band sang 'Bohemian Rhapsody'?",
      options: ["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"],
      correct: 2,
      category: "Music"
    },
    {
      id: 38,
      question: "How many strings does a standard guitar have?",
      options: ["4", "5", "6", "7"],
      correct: 2,
      category: "Music"
    },
    {
      id: 39,
      question: "Who composed the 'Four Seasons'?",
      options: ["Bach", "Mozart", "Vivaldi", "Beethoven"],
      correct: 2,
      category: "Music"
    },
    {
      id: 40,
      question: "Which music genre originated in Jamaica?",
      options: ["Jazz", "Blues", "Reggae", "Hip Hop"],
      correct: 2,
      category: "Music"
    }
  ],
  MOVIES: [
    {
      id: 41,
      question: "Which movie won the Academy Award for Best Picture in 2020?",
      options: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"],
      correct: 2,
      category: "Movies"
    },
    {
      id: 42,
      question: "Who directed 'Pulp Fiction'?",
      options: ["Martin Scorsese", "Quentin Tarantino", "David Fincher", "Steven Spielberg"],
      correct: 1,
      category: "Movies"
    },
    {
      id: 43,
      question: "What is the name of the fictional African nation in 'Black Panther'?",
      options: ["Zamunda", "Genosha", "Wakanda", "Latveria"],
      correct: 2,
      category: "Movies"
    },
    {
      id: 44,
      question: "Which movie features the character Darth Vader?",
      options: ["Star Trek", "Star Wars", "Guardians of the Galaxy", "The Matrix"],
      correct: 1,
      category: "Movies"
    },
    {
      id: 45,
      question: "Who played Jack Dawson in 'Titanic'?",
      options: ["Brad Pitt", "Tom Cruise", "Leonardo DiCaprio", "Matt Damon"],
      correct: 2,
      category: "Movies"
    }
  ],
  MATHEMATICS: [
    {
      id: 46,
      question: "What is the value of π (pi) rounded to two decimal places?",
      options: ["3.14", "3.16", "3.18", "3.20"],
      correct: 0,
      category: "Mathematics"
    },
    {
      id: 47,
      question: "What is the square root of 64?",
      options: ["6", "7", "8", "9"],
      correct: 2,
      category: "Mathematics"
    },
    {
      id: 48,
      question: "What is 12 × 12?",
      options: ["124", "134", "144", "154"],
      correct: 2,
      category: "Mathematics"
    },
    {
      id: 49,
      question: "What is the mathematical constant e approximately equal to?",
      options: ["2.71", "3.14", "1.41", "1.73"],
      correct: 0,
      category: "Mathematics"
    },
    {
      id: 50,
      question: "What is 15% of 200?",
      options: ["25", "30", "35", "40"],
      correct: 1,
      category: "Mathematics"
    }
  ],
  ANIMALS: [
    {
      id: 56,
      question: "What is the fastest land animal?",
      options: ["Cheetah", "Lion", "Horse", "Gazelle"],
      correct: 0,
      category: "Animals & Nature"
    },
    {
      id: 57,
      question: "How many hearts does an octopus have?",
      options: ["1", "2", "3", "4"],
      correct: 2,
      category: "Animals & Nature"
    },
    {
      id: 58,
      question: "What is the largest species of fish?",
      options: ["Great White Shark", "Whale Shark", "Manta Ray", "Giant Squid"],
      correct: 1,
      category: "Animals & Nature"
    },
    {
      id: 59,
      question: "Which animal is known for changing its color?",
      options: ["Chameleon", "Gecko", "Iguana", "Monitor Lizard"],
      correct: 0,
      category: "Animals & Nature"
    },
    {
      id: 60,
      question: "What do bees collect from flowers?",
      options: ["Pollen", "Nectar", "Both", "Seeds"],
      correct: 2,
      category: "Animals & Nature"
    },
    {
      id: 61,
      question: "Which bird is known for its colorful tail feathers?",
      options: ["Peacock", "Parrot", "Flamingo", "Swan"],
      correct: 0,
      category: "Animals & Nature"
    },
    {
      id: 62,
      question: "What is a group of lions called?",
      options: ["Pack", "Herd", "Pride", "School"],
      correct: 2,
      category: "Animals & Nature"
    },
    {
      id: 63,
      question: "Which mammal can fly?",
      options: ["Flying Squirrel", "Bat", "Sugar Glider", "All of these"],
      correct: 1,
      category: "Animals & Nature"
    }
  ],
  FOOD: [
    {
      id: 64,
      question: "Which spice is known as the 'King of Spices'?",
      options: ["Black Pepper", "Cinnamon", "Cardamom", "Saffron"],
      correct: 3,
      category: "Food & Cooking"
    },
    {
      id: 65,
      question: "Which country is famous for pizza?",
      options: ["Spain", "Italy", "France", "Greece"],
      correct: 1,
      category: "Food & Cooking"
    },
    {
      id: 66,
      question: "What is the main ingredient in hummus?",
      options: ["Chickpeas", "Lentils", "Black Beans", "Kidney Beans"],
      correct: 0,
      category: "Food & Cooking"
    },
    {
      id: 67,
      question: "Which vegetable is known as the 'nightshade'?",
      options: ["Carrot", "Tomato", "Broccoli", "Spinach"],
      correct: 1,
      category: "Food & Cooking"
    },
    {
      id: 68,
      question: "What type of food is sushi?",
      options: ["Korean", "Japanese", "Chinese", "Thai"],
      correct: 1,
      category: "Food & Cooking"
    },
    {
      id: 69,
      question: "Which grain is used to make beer?",
      options: ["Rice", "Wheat", "Barley", "Corn"],
      correct: 2,
      category: "Food & Cooking"
    },
    {
      id: 70,
      question: "What is the most expensive spice by weight?",
      options: ["Vanilla", "Cardamom", "Saffron", "Cinnamon"],
      correct: 2,
      category: "Food & Cooking"
    }
  ],
  ART: [
    {
      id: 71,
      question: "Who painted the 'Mona Lisa'?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correct: 2,
      category: "Art & Culture"
    },
    {
      id: 72,
      question: "Which art movement did Pablo Picasso help create?",
      options: ["Impressionism", "Cubism", "Surrealism", "Abstract Expressionism"],
      correct: 1,
      category: "Art & Culture"
    },
    {
      id: 73,
      question: "What is the most famous artwork in the Louvre Museum?",
      options: ["Venus de Milo", "The Birth of Venus", "Mona Lisa", "Liberty Leading the People"],
      correct: 2,
      category: "Art & Culture"
    },
    {
      id: 74,
      question: "Which ancient civilization created the Terracotta Army?",
      options: ["Egyptians", "Greeks", "Chinese", "Romans"],
      correct: 2,
      category: "Art & Culture"
    },
    {
      id: 75,
      question: "What is the Japanese art of paper folding called?",
      options: ["Ikebana", "Origami", "Calligraphy", "Sumi-e"],
      correct: 1,
      category: "Art & Culture"
    },
    {
      id: 76,
      question: "Who sculpted 'The Thinker'?",
      options: ["Michelangelo", "Auguste Rodin", "Donatello", "Bernini"],
      correct: 1,
      category: "Art & Culture"
    }
  ],
  BUSINESS: [
    {
      id: 77,
      question: "What does GDP stand for?",
      options: ["Gross Domestic Product", "Global Development Program", "Government Debt Policy", "General Business Plan"],
      correct: 0,
      category: "Business & Economics"
    },
    {
      id: 78,
      question: "Which company has the world's largest market capitalization as of 2023?",
      options: ["Amazon", "Google", "Apple", "Microsoft"],
      correct: 2,
      category: "Business & Economics"
    },
    {
      id: 79,
      question: "What is inflation?",
      options: ["Decrease in prices", "Increase in prices", "Stable prices", "Price control"],
      correct: 1,
      category: "Business & Economics"
    },
    {
      id: 80,
      question: "Which stock index measures the performance of 30 large US companies?",
      options: ["NASDAQ", "Dow Jones", "S&P 500", "Russell 2000"],
      correct: 1,
      category: "Business & Economics"
    },
    {
      id: 81,
      question: "What is the term for when a company's value exceeds its book value?",
      options: ["Undervalued", "Fair Value", "Overvalued", "Market Premium"],
      correct: 2,
      category: "Business & Economics"
    },
    {
      id: 82,
      question: "Which type of business structure provides limited liability protection?",
      options: ["Sole Proprietorship", "Partnership", "Corporation", "LLC"],
      correct: 2,
      category: "Business & Economics"
    }
  ],
  HEALTH: [
    {
      id: 83,
      question: "How many bones are in the adult human body?",
      options: ["186", "206", "226", "246"],
      correct: 1,
      category: "Health & Medicine"
    },
    {
      id: 84,
      question: "What is the largest organ in the human body?",
      options: ["Brain", "Heart", "Liver", "Skin"],
      correct: 3,
      category: "Health & Medicine"
    },
    {
      id: 85,
      question: "Which vitamin is produced when skin is exposed to sunlight?",
      options: ["Vitamin A", "Vitamin B12", "Vitamin C", "Vitamin D"],
      correct: 3,
      category: "Health & Medicine"
    },
    {
      id: 86,
      question: "What is the normal human body temperature in Celsius?",
      options: ["36.5-37.5°C", "35.5-36.5°C", "37.5-38.5°C", "38.5-39.5°C"],
      correct: 0,
      category: "Health & Medicine"
    },
    {
      id: 87,
      question: "Which blood type is considered the universal donor?",
      options: ["A", "B", "AB", "O negative"],
      correct: 3,
      category: "Health & Medicine"
    },
    {
      id: 88,
      question: "What is the medical term for high blood pressure?",
      options: ["Hypotension", "Hypertension", "Tachycardia", "Bradycardia"],
      correct: 1,
      category: "Health & Medicine"
    },
    {
      id: 89,
      question: "Which disease was declared eradicated in 1980?",
      options: ["Polio", "Smallpox", "Malaria", "Yellow Fever"],
      correct: 1,
      category: "Health & Medicine"
    }
  ],
  SPACE: [
    {
      id: 90,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correct: 1,
      category: "Space & Astronomy"
    },
    {
      id: 91,
      question: "What is the largest planet in our solar system?",
      options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
      correct: 1,
      category: "Space & Astronomy"
    },
    {
      id: 92,
      question: "Which galaxy contains our solar system?",
      options: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"],
      correct: 1,
      category: "Space & Astronomy"
    },
    {
      id: 93,
      question: "What is the closest star to Earth?",
      options: ["Alpha Centauri", "Proxima Centauri", "The Sun", "Sirius"],
      correct: 2,
      category: "Space & Astronomy"
    },
    {
      id: 94,
      question: "Which planet has the most moons?",
      options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
      correct: 1,
      category: "Space & Astronomy"
    },
    {
      id: 95,
      question: "What is a black hole?",
      options: ["A dark planet", "A region with extreme gravity", "A type of star", "An asteroid"],
      correct: 1,
      category: "Space & Astronomy"
    },
    {
      id: 96,
      question: "Which astronaut was the first person to walk on the Moon?",
      options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"],
      correct: 1,
      category: "Space & Astronomy"
    },
    {
      id: 97,
      question: "What is the name of our moon?",
      options: ["Europa", "Luna", "Titan", "Ganymede"],
      correct: 1,
      category: "Space & Astronomy"
    }
  ],
  GENERAL: [
    {
      id: 98,
      question: "What is the largest mammal in the world?",
      options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
      correct: 1,
      category: "General Knowledge"
    },
    {
      id: 99,
      question: "How many continents are there on Earth?",
      options: ["5", "6", "7", "8"],
      correct: 2,
      category: "General Knowledge"
    },
    {
      id: 100,
      question: "Which language has the most native speakers?",
      options: ["English", "Spanish", "Mandarin Chinese", "Hindi"],
      correct: 2,
      category: "General Knowledge"
    },
    {
      id: 101,
      question: "What is the chemical formula for water?",
      options: ["H2O", "CO2", "NaCl", "H2SO4"],
      correct: 0,
      category: "General Knowledge"
    },
    {
      id: 102,
      question: "Which is the largest ocean on Earth?",
      options: ["Atlantic", "Indian", "Pacific", "Arctic"],
      correct: 2,
      category: "General Knowledge"
    },
    {
      id: 103,
      question: "What is the capital of Australia?",
      options: ["Sydney", "Melbourne", "Canberra", "Perth"],
      correct: 2,
      category: "General Knowledge"
    },
    {
      id: 104,
      question: "Which gas makes up the largest portion of Earth's atmosphere?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
      correct: 1,
      category: "General Knowledge"
    },
    {
      id: 105,
      question: "What is the currency of Japan?",
      options: ["Won", "Yuan", "Yen", "Dollar"],
      correct: 2,
      category: "General Knowledge"
    }
  ]
};

// Get all questions as a flat array
const getAllQuestions = () => {
  return Object.values(questions).flat();
};

// Get questions by category
const getQuestionsByCategory = (category) => {
  return questions[category] || [];
};

// Skills configuration
const SKILLS = {
  DIRECT_SHOT: {
    name: "Direct Shot",
    cost: 20,
    damage: 15,
    description: "Deal 15 damage to one player"
  },
  HEALTH_STEAL: {
    name: "Health Steal",
    cost: 30,
    damage: 10,
    description: "Steal 10 HP from opponent"
  },
  TIME_BOMB: {
    name: "Time Bomb",
    cost: 25,
    damage: 20,
    description: "20 damage if next player answers wrong"
  }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Create room with enhanced features
  socket.on('create_room', (data) => {
    const roomId = uuidv4().substr(0, 8).toUpperCase();
    const { playerName, roomName, gameMode = 'CLASSIC', category = 'GENERAL' } = data;
    const mode = GAME_MODES[gameMode] || GAME_MODES.CLASSIC;
    const selectedCategory = CATEGORIES[category] || CATEGORIES.GENERAL;
    
    const playerData = {
      id: socket.id,
      name: playerName || `Player_${socket.id.substr(0, 4)}`,
      health: 100,
      skillPoints: 0,
      isHost: true,
      isReady: false,
      uid: data.uid || null,
      displayName: playerName || null
    };

    const roomData = {
      id: roomId,
      name: roomName || `${playerData.name}'s Room`,
      hostId: socket.id,
      players: [playerData],
      gameState: 'waiting',
      currentQuestion: null,
      questionTimer: null,
      currentTurn: null,
      skills: { [socket.id]: {} },
      gameMode: gameMode,
      timerDuration: mode.timerDuration,
      maxPlayers: mode.maxPlayers,
      category: category,
      categoryInfo: selectedCategory,
      createdAt: new Date().toISOString()
    };

    gameRooms.set(roomId, roomData);
    availableRooms.set(roomId, {
      id: roomId,
      name: roomData.name,
      players: 1,
      maxPlayers: mode.maxPlayers,
      gameMode: gameMode,
      gameState: 'waiting',
      host: playerData.name,
      category: category,
      categoryInfo: selectedCategory,
      createdAt: roomData.createdAt
    });

    players.set(socket.id, {
      roomId,
      playerData
    });

    socket.join(roomId);
    socket.emit('room_created', { roomId, player: playerData, room: roomData });
    socket.emit('room_players', { players: [playerData] });

    // Broadcast room list update
    broadcastRoomList();

    console.log(`Room created: ${roomId} by ${playerData.name} (${gameMode} - ${selectedCategory.name})`);
  });

  // Join room
  socket.on('join_room', (data) => {
    const { roomId, playerName, uid } = data;
    const room = gameRooms.get(roomId);

    if (!room) {
      socket.emit('error_message', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error_message', { message: `Room is full (max ${room.maxPlayers} players)` });
      return;
    }

    if (room.gameState !== 'waiting') {
      socket.emit('error_message', { message: 'Game already in progress' });
      return;
    }

    const playerData = {
      id: socket.id,
      name: playerName || `Player_${socket.id.substr(0, 4)}`,
      health: 100,
      skillPoints: 0,
      isHost: false,
      isReady: false,
      uid: uid || null,
      displayName: playerName || null
    };

    room.players.push(playerData);
    players.set(socket.id, {
      roomId,
      playerData
    });

    socket.join(roomId);

    // Update available rooms
    const roomInfo = availableRooms.get(roomId);
    if (roomInfo) {
      roomInfo.players = room.players.length;
      availableRooms.set(roomId, roomInfo);
    }

    // Notify room about new player
    socket.to(roomId).emit('player_joined', { player: playerData });
    socket.emit('room_joined', { 
      roomId, 
      player: playerData,
      players: room.players,
      room: room
    });

    // Broadcast room list update
    broadcastRoomList();

    console.log(`${playerData.name} joined room ${roomId} (${room.categoryInfo.name})`);
  });

  // Get available rooms (for room discovery)
  socket.on('get_rooms', () => {
    const rooms = Array.from(availableRooms.values())
      .filter(room => room.gameState === 'waiting' && room.players < room.maxPlayers)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    socket.emit('room_list', { rooms });
  });

  // Player ready status
  socket.on('player_ready', () => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = gameRooms.get(playerInfo.roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.isReady = true;
      io.to(playerInfo.roomId).emit('players_updated', { players: room.players });
    }

    // Check if all players are ready and room has minimum players
    if (room.players.length >= 2 && room.players.every(p => p.isReady)) {
      startGame(playerInfo.roomId);
    }
  });

  // Submit answer
  socket.on('submit_answer', (data) => {
    const { answerIndex } = data;
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = gameRooms.get(playerInfo.roomId);
    if (!room || room.gameState !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || room.currentTurn !== socket.id) return;

    // Calculate points for correct answer (faster answers = more points)
    const isCorrect = answerIndex === room.currentQuestion.correct;
    const pointsEarned = isCorrect ? 10 : 0;
    player.skillPoints += pointsEarned;

    // Process answer and move to next turn
    processAnswer(playerInfo.roomId, socket.id, isCorrect);
  });

  // Use skill
  socket.on('use_skill', (data) => {
    const { skillType, targetId } = data;
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = gameRooms.get(playerInfo.roomId);
    if (!room || room.gameState !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    const target = room.players.find(p => p.id === targetId);
    
    if (!player || !target) return;

    const skill = SKILLS[skillType];
    if (!skill || player.skillPoints < skill.cost) return;

    // Apply skill effect
    player.skillPoints -= skill.cost;
    
    switch (skillType) {
      case 'DIRECT_SHOT':
        target.health = Math.max(0, target.health - skill.damage);
        break;
      case 'HEALTH_STEAL':
        target.health = Math.max(0, target.health - skill.damage);
        player.health = Math.min(100, player.health + skill.damage);
        break;
      case 'TIME_BOMB':
        room.timeBomb = { targetId: target.id, active: true };
        break;
    }

    // Check if target is eliminated
    if (target.health <= 0) {
      eliminatePlayer(playerInfo.roomId, target.id);
    }

    io.to(playerInfo.roomId).emit('skill_used', {
      player: player.name,
      skill: skill.name,
      target: target.name,
      effect: {
        playerHealth: player.health,
        targetHealth: target.health,
        playerSP: player.skillPoints
      }
    });
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const playerInfo = players.get(socket.id);
    
    if (playerInfo) {
      const room = gameRooms.get(playerInfo.roomId);
      if (room) {
        // Remove player from room
        room.players = room.players.filter(p => p.id !== socket.id);
        
        // Update available rooms
        const roomInfo = availableRooms.get(playerInfo.roomId);
        if (roomInfo) {
          roomInfo.players = room.players.length;
          if (room.players.length === 0) {
            availableRooms.delete(playerInfo.roomId);
          } else {
            availableRooms.set(playerInfo.roomId, roomInfo);
          }
        }
        
        // If room is empty, delete it
        if (room.players.length === 0) {
          gameRooms.delete(playerInfo.roomId);
          availableRooms.delete(playerInfo.roomId);
          console.log(`Room ${playerInfo.roomId} deleted (empty)`);
        } else {
          // Notify remaining players
          io.to(playerInfo.roomId).emit('player_left', { 
            playerId: socket.id,
            players: room.players 
          });
          
          // If host left, assign new host
          if (socket.id === room.hostId) {
            room.hostId = room.players[0].id;
            room.players[0].isHost = true;
            
            const roomInfo = availableRooms.get(playerInfo.roomId);
            if (roomInfo) {
              roomInfo.host = room.players[0].name;
              availableRooms.set(playerInfo.roomId, roomInfo);
            }
            
            io.to(playerInfo.roomId).emit('host_changed', { newHost: room.players[0].name });
          }
        }
      }
      players.delete(socket.id);
      
      // Broadcast room list update
      broadcastRoomList();
    }
  });
});

// Helper function to broadcast room list updates
function broadcastRoomList() {
  const rooms = Array.from(availableRooms.values())
    .filter(room => room.gameState === 'waiting' && room.players < room.maxPlayers)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  io.emit('room_list', { rooms });
}

// Game functions
function startGame(roomId) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  room.gameState = 'playing';
  room.currentTurn = room.players[0].id;
  
  // Update room status in available rooms
  const roomInfo = availableRooms.get(roomId);
  if (roomInfo) {
    roomInfo.gameState = 'playing';
    availableRooms.set(roomId, roomInfo);
  }
  
  // Start first question
  nextQuestion(roomId);
  
  io.to(roomId).emit('game_started', { 
    players: room.players,
    currentTurn: room.currentTurn,
    gameMode: room.gameMode,
    timerDuration: room.timerDuration,
    category: room.category,
    categoryInfo: room.categoryInfo
  });

  console.log(`Game started in room ${roomId} (${room.gameMode} - ${room.categoryInfo.name})`);
}

function nextQuestion(roomId) {
  const room = gameRooms.get(roomId);
  if (!room || room.gameState !== 'playing') return;

  // Get questions based on room category
  let availableQuestions = [];
  
  if (room.category === 'GENERAL') {
    // If general knowledge, mix questions from all categories
    availableQuestions = getAllQuestions();
  } else {
    // Get questions from specific category
    availableQuestions = getQuestionsByCategory(room.category);
  }
  
  // If no questions in category, fallback to general
  if (availableQuestions.length === 0) {
    availableQuestions = getAllQuestions();
  }
  
  // Get random question from available questions
  const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  room.currentQuestion = question;

  // Set timer based on game mode
  const timerDuration = room.timerDuration * 1000;
  room.questionTimer = setTimeout(() => {
    processAnswer(roomId, room.currentTurn, false); // Auto-fail on timeout
  }, timerDuration);

  io.to(roomId).emit('new_question', {
    question: question.question,
    options: question.options,
    category: question.category,
    timer: room.timerDuration
  });

  // Start countdown timer
  let timeLeft = room.timerDuration;
  const countdown = setInterval(() => {
    timeLeft--;
    io.to(roomId).emit('timer_update', { timeLeft });
    
    if (timeLeft <= 0) {
      clearInterval(countdown);
    }
  }, 1000);
}

function processAnswer(roomId, playerId, isCorrect) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  // Clear timer
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
  }

  // Apply time bomb if active
  if (room.timeBomb && room.timeBomb.active && !isCorrect) {
    const target = room.players.find(p => p.id === room.timeBomb.targetId);
    if (target) {
      target.health = Math.max(0, target.health - SKILLS.TIME_BOMB.damage);
      if (target.health <= 0) {
        eliminatePlayer(roomId, target.id);
      }
    }
    room.timeBomb = null; // Reset time bomb
  }

  io.to(roomId).emit('answer_result', {
    playerId,
    isCorrect,
    players: room.players
  });

  // Check for game end
  const alivePlayers = room.players.filter(p => p.health > 0);
  if (alivePlayers.length <= 1) {
    endGame(roomId, alivePlayers[0] || null);
    return;
  }

  // Move to next turn
  const currentIndex = room.players.findIndex(p => p.id === playerId);
  let nextIndex = (currentIndex + 1) % room.players.length;
  
  // Skip eliminated players
  while (room.players[nextIndex].health <= 0) {
    nextIndex = (nextIndex + 1) % room.players.length;
  }

  room.currentTurn = room.players[nextIndex].id;
  io.to(roomId).emit('next_turn', { 
    playerId: room.currentTurn,
    players: room.players 
  });

  // Next question after brief delay
  setTimeout(() => {
    nextQuestion(roomId);
  }, 3000);
}

function eliminatePlayer(roomId, playerId) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  const player = room.players.find(p => p.id === playerId);
  if (player) {
    io.to(roomId).emit('player_eliminated', { 
      playerId,
      playerName: player.name 
    });
  }
}

function endGame(roomId, winner) {
  const room = gameRooms.get(roomId);
  if (!room) return;

  room.gameState = 'finished';
  
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
  }

  // Remove from available rooms
  availableRooms.delete(roomId);

  io.to(roomId).emit('game_ended', {
    winner: winner ? winner.name : null,
    players: room.players,
    gameMode: room.gameMode,
    category: room.category,
    categoryInfo: room.categoryInfo
  });

  console.log(`Game ended in room ${roomId}, winner: ${winner?.name || 'None'} (${room.categoryInfo.name})`);
}

// Enhanced API endpoints
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    rooms: gameRooms.size, 
    players: players.size,
    categories: Object.keys(CATEGORIES).length,
    totalQuestions: getAllQuestions().length,
    timestamp: new Date().toISOString()
  });
});

// Get room info endpoint
app.get('/room/:roomId', (req, res) => {
  const room = gameRooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    id: room.id,
    name: room.name,
    players: room.players.length,
    maxPlayers: room.maxPlayers,
    gameState: room.gameState,
    gameMode: room.gameMode,
    category: room.category,
    categoryInfo: room.categoryInfo,
    host: room.players.find(p => p.id === room.hostId)?.name || 'Unknown',
    createdAt: room.createdAt
  });
});

// Get all available rooms (for room discovery)
app.get('/rooms', (req, res) => {
  const rooms = Array.from(availableRooms.values())
    .filter(room => room.gameState === 'waiting' && room.players < room.maxPlayers)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({ rooms });
});

// Get categories info
app.get('/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// Get questions by category
app.get('/questions/:category', (req, res) => {
  const { category } = req.params;
  const categoryQuestions = getQuestionsByCategory(category);
  res.json({ 
    category,
    questions: categoryQuestions,
    count: categoryQuestions.length
  });
});

// Room statistics endpoint
app.get('/stats', (req, res) => {
  const roomsByCategory = {};
  Object.keys(CATEGORIES).forEach(cat => {
    roomsByCategory[cat] = Array.from(availableRooms.values()).filter(r => r.category === cat).length;
  });

  res.json({
    totalRooms: gameRooms.size,
    availableRooms: availableRooms.size,
    totalPlayers: players.size,
    totalQuestions: getAllQuestions().length,
    categories: Object.keys(CATEGORIES).length,
    roomsByCategory,
    gameModes: {
      classic: Array.from(availableRooms.values()).filter(r => r.gameMode === 'CLASSIC').length,
      rapid: Array.from(availableRooms.values()).filter(r => r.gameMode === 'RAPID').length,
      survival: Array.from(availableRooms.values()).filter(r => r.gameMode === 'SURVIVAL').length
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Quiz Duel server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🎮 Available rooms: http://localhost:${PORT}/rooms`);
  console.log(`📚 Categories: http://localhost:${PORT}/categories`);
  console.log(`📈 Stats: http://localhost:${PORT}/stats`);
  console.log(`🎯 Total Questions: ${getAllQuestions().length} across ${Object.keys(CATEGORIES).length} categories`);
});