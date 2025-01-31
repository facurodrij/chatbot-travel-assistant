import { existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import * as readline from 'readline';

const envFilePath = resolve(__dirname, '.env');

if (!existsSync(envFilePath)) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Please enter your OPENAI_API_KEY: ', (openaiApiKey) => {
        rl.question('Please enter your TAVILY_API_KEY: ', (tavilyApiKey) => {
            rl.question('Please enter your OPEN_WEATHER_API_KEY: ', (openWeatherApiKey) => {
                const envContent = `OPENAI_API_KEY=${openaiApiKey}\nTAVILY_API_KEY=${tavilyApiKey}\nOPEN_WEATHER_API_KEY=${openWeatherApiKey}`;
                writeFileSync(envFilePath, envContent);
                console.log('.env file created.');
                rl.close();
            });
        });
    });
}
