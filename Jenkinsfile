pipeline {
    agent any

    environment {
        MONGO_TEST_URI = 'mongodb://bookstore-mongo:27017/bookstore_test'
        SONAR_TOKEN = credentials('sonar-token')
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

        stage('Code Quality') {
            steps {
                echo 'Running SonarQube code quality analysis...'
                sh '''
                sonar-scanner \
                  -Dsonar.projectKey=bookstore-backend \
                  -Dsonar.sources=. \
                  -Dsonar.host.url=http://sonarqube:9000 \
                  -Dsonar.token=${SONAR_TOKEN} \
                  -Dsonar.exclusions=node_modules/**,docs/**
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Build, tests, and code quality checks passed successfully.'
        }
        failure {
            echo 'Pipeline failed — check the stage logs above.'
        }
    }
}