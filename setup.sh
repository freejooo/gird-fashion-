#!/bin/bash

# Install dependencies
echo "Installing dependencies..."

cd fashion-flair
cd client 
npm install

cd ../server
npm install

# Set up .env file
echo "Setting up .env file..."

touch server/.env
echo "OPENAI_API_KEY='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'" >> .env
echo "MONGO_URL='mongodb://localhost:27017'" >> .env
echo "SESSION_SECRET='SOME_RANDOM_STRING'" >> .env 
echo "JWT_SECRET='SOME_RANDOM_STRING'" >> .env

# Start server and client
echo "Starting server and client..."

cd server
npm run dev &

cd ../client
npm run dev &

echo "App started! Access it at http://localhost:3000"
