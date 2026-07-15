pipeline {
    agent any

    environment {
        REGISTRY = 'kero-dockerhub-username'   // غيّرها ليوزرك الحقيقي في Docker Hub
        NAMESPACE = 'ecommerce'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    env.CART_CHANGED    = sh(script: "git diff --name-only HEAD~1 HEAD | grep -q '^Cart/' && echo true || echo false", returnStdout: true).trim()
                    env.PRODUCT_CHANGED = sh(script: "git diff --name-only HEAD~1 HEAD | grep -q '^Product/' && echo true || echo false", returnStdout: true).trim()
                    env.USER_CHANGED    = sh(script: "git diff --name-only HEAD~1 HEAD | grep -q '^User/' && echo true || echo false", returnStdout: true).trim()
                }
            }
        }

        stage('Build & Push - Cart') {
            when { environment name: 'CART_CHANGED', value: 'true' }
            steps {
                script {
                    dockerImage = docker.build("${REGISTRY}/cart:${env.BUILD_NUMBER}", "./Cart")
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-creds') {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Build & Push - Product') {
            when { environment name: 'PRODUCT_CHANGED', value: 'true' }
            steps {
                script {
                    dockerImage = docker.build("${REGISTRY}/product:${env.BUILD_NUMBER}", "./Product")
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-creds') {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Build & Push - User') {
            when { environment name: 'USER_CHANGED', value: 'true' }
            steps {
                script {
                    dockerImage = docker.build("${REGISTRY}/user:${env.BUILD_NUMBER}", "./User")
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-creds') {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-minikube']) {
                    script {
                        if (env.CART_CHANGED == 'true') {
                            sh "kubectl set image deployment/cart-deployment cart-service=${REGISTRY}/cart:${env.BUILD_NUMBER} -n ${NAMESPACE}"
                        }
                        if (env.PRODUCT_CHANGED == 'true') {
                            sh "kubectl set image deployment/product-deployment product-service=${REGISTRY}/product:${env.BUILD_NUMBER} -n ${NAMESPACE}"
                        }
                        if (env.USER_CHANGED == 'true') {
                            sh "kubectl set image deployment/user-deployment user-service=${REGISTRY}/user:${env.BUILD_NUMBER} -n ${NAMESPACE}"
                        }
                    }
                }
            }
        }

        stage('Verify Rollout') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-minikube']) {
                    script {
                        if (env.CART_CHANGED == 'true') {
                            sh "kubectl rollout status deployment/cart-deployment -n ${NAMESPACE} --timeout=90s"
                        }
                        if (env.PRODUCT_CHANGED == 'true') {
                            sh "kubectl rollout status deployment/product-deployment -n ${NAMESPACE} --timeout=90s"
                        }
                        if (env.USER_CHANGED == 'true') {
                            sh "kubectl rollout status deployment/user-deployment -n ${NAMESPACE} --timeout=90s"
                        }
                    }
                }
            }
        }
    }

    post {
        failure {
            echo 'Pipeline فشل - راجع الـ Console Output عشان تعرف الـ stage اللي وقف فيها'
        }
        success {
            echo 'تم الـ Build والـ Deploy بنجاح لكل السيرفيسات اللي اتغيرت'
        }
    }
}
