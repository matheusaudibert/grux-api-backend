# Discord Profile System

Complete system to capture and store Discord user profiles through a bot and provide data via database.

## Features

- **Discord Bot** with `/register` and `/check` commands
- **Automatic updates** every 10 minutes
- **Token rotation system** to avoid rate limits
- **MongoDB database** for data persistence

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure `.env` file with your credentials

4. Run the system:

   ```bash
   npm run start:dev
   ```

## Configuration

### Discord Bot

1. Create a bot in Discord Developer Portal
2. Add bot to your server with slash command permissions
3. Configure variables in `.env`

### MongoDB

1. Use MongoDB Atlas (recommended)
2. Configure connection string in `.env`

### Discord Tokens

1. Obtain Discord user tokens (use responsibly)
2. Add to `.env` separated by commas

## Commands

- `/register` - Register your profile in the system
- `/check` - Check your profile information

## System Flow

1. User uses `/register` on Discord
2. Bot registers user in database
3. System fetches profile data from Discord API
4. Data is automatically updated every 10 minutes
5. Data is stored for future API consumption

## Legal Notice

This project is for educational purposes. Use Discord tokens responsibly and respect Discord's Terms of Service. 3. Sistema busca dados do perfil na API Discord 4. Dados são atualizados automaticamente a cada 10 minutos 5. API REST disponibiliza os dados para consumo

## ⚠️ Aviso Legal

Este projeto é para fins educacionais. Use tokens Discord com responsabilidade e respeite os Terms of Service do Discord.
