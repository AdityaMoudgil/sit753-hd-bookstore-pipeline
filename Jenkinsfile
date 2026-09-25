pipeline {
    agent any

    environment {
        MONGO_TEST_URI = 'mongodb://bookstore-mongo:27017/bookstore_test'
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
                echo 'Installing dependencies and running test suite...'
                sh 'npm install'
                sh 'npm test'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Build and tests passed successfully.'
        }
        failure {
            echo 'Pipeline failed — check the stage logs above.'
        }
    }
}