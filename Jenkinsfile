pipeline {
    agent any

    environment {
        ATLAS_URI = 'mongodb://bookstore-mongo:27017/bookstore_ci'
    }

    stages {
        stage('Build') {
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t bookstore-app:${BUILD_NUMBER} .'
            }
        }

        stage('Test') {
            steps {
                echo 'Running test suite inside a Node container...'
                sh '''
                docker run --rm \
                  --network bookstore-net \
                  -e ATLAS_URI=mongodb://bookstore-mongo:27017/bookstore_ci \
                  -v $(pwd):/app -w /app \
                  node:20-alpine sh -c "npm install && npm test"
                '''
            }
        }
    }
}