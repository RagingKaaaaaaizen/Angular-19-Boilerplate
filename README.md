add description if naay bagong install pakages

// use this to fetch all git branches

-- git fetch --all
-- git branch -r

// to show local and remote branches in repository

-- git branch -a

// Use to install dependencies for accounts folder

-- npm install @angular/core @angular/common @angular/forms @angular/router rxjs bootstrap

//Use for git merge on terminal

-- git config --global core.editor "code --wait"

//To solve for @app/_services problem

step 1: Create a tsconfig.json file on root dir
step 2: copy paste this to tsconfig.json

{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@app/*": ["src/app/*"]
    }
  }
}

