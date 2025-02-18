#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting AWS Lambda setup with Serverless Framework and TypeScript...${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if serverless is installed globally
if ! command -v serverless &> /dev/null; then
    echo -e "${BLUE}Installing Serverless Framework globally...${NC}"
    npm install -g serverless
fi

# Initialize package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo -e "${BLUE}Initializing package.json...${NC}"
    npm init -y
fi

# Install dependencies with legacy peer deps to avoid conflicts
echo -e "${BLUE}Installing dependencies...${NC}"
npm install --save-dev \
    @types/aws-lambda \
    @types/node \
    typescript \
    ts-node \
    serverless \
    serverless-offline \
    esbuild \
    serverless-esbuild \
    --legacy-peer-deps

# Create tsconfig.json if it doesn't exist
if [ ! -f "tsconfig.json" ]; then
    echo -e "${BLUE}Creating tsconfig.json...${NC}"
    cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "rootDir": "./",
    "outDir": ".build",
    "baseUrl": "."
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", ".serverless", ".build"]
}
EOF
fi

# Create src directory
mkdir -p src

# Update serverless.yml
echo -e "${BLUE}Creating serverless.yml...${NC}"
cat > serverless.yml << EOF
service: aws-typescript-api

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: \${opt:stage, 'dev'}
  
plugins:
  - serverless-esbuild
  - serverless-offline

custom:
  esbuild:
    bundle: true
    minify: false
    sourcemap: true
    exclude: []
    target: 'node18'
    platform: 'node'
    concurrency: 10

functions:
  hello:
    handler: src/handler.hello
    events:
      - http:
          path: /hello
          method: get
EOF

# Create example handler
echo -e "${BLUE}Creating example handler...${NC}"
cat > src/handler.ts << EOF
import { APIGatewayProxyHandler } from 'aws-lambda';

export const hello: APIGatewayProxyHandler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Hello from AWS Lambda!',
        input: event,
      },
      null,
      2
    ),
  };
};
EOF

# Update package.json scripts
echo -e "${BLUE}Updating package.json scripts...${NC}"
node -e '
const fs = require("fs");
const package = JSON.parse(fs.readFileSync("package.json"));
package.scripts = {
  ...package.scripts,
  "dev": "serverless offline",
  "deploy": "serverless deploy",
  "build": "tsc",
  "type-check": "tsc --noEmit"
};
fs.writeFileSync("package.json", JSON.stringify(package, null, 2));
'

# Create .gitignore
echo -e "${BLUE}Creating .gitignore...${NC}"
cat > .gitignore << EOF
# package directories
node_modules
jspm_packages

# Serverless directories
.serverless
.build
.esbuild

# TypeScript
*.js
*.js.map
!jest.config.js
!esbuild.config.js

# ENV files
.env*

# IDE
.idea
.vscode
EOF

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo -e "${BLUE}Initializing git repository...${NC}"
    git init
fi

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}You can now run the following commands:${NC}"
echo -e "  ${BLUE}npm run dev${NC} - Run the function locally"
echo -e "  ${BLUE}npm run deploy${NC} - Deploy to AWS"
echo -e "\n${BLUE}Note: Make sure to configure your AWS credentials using 'aws configure' before deploying${NC}"