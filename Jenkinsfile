pipeline {
    agent any

    environment {
        ATLAS_URI = 'mongodb://bookstore-mongo:27017/bookstore_ci'
    }

    stages {
        stage('Build') {
            steps {
                echo 'Installing dependencies and building Docker image...'
                sh 'npm install'
                sh 'docker build -t bookstore-app:${BUILD_NUMBER} .'
            }
        }

        stage('Test') {
            steps {
                echo 'Running test suite...'
                sh 'npm test'
            }
        }
    }
}