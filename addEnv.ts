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
            rl.question('Please enter your OPENWEATHERMAP_API_KEY: ', (openWeatherMapApiKey) => {
                const envContent = `OPENAI_API_KEY=${openaiApiKey}\nTAVILY_API_KEY=${tavilyApiKey}\nOPENWEATHERMAP_API_KEY=${openWeatherMapApiKey}`;
                writeFileSync(envFilePath, envContent);
                console.log('.env file created.');
                rl.close();
            });
        });
    });
}
