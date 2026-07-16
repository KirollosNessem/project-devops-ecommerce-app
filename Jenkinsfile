pipeline {
    agent any

    environment {
        REGISTRY = 'keronisem11'   
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

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=ecommerce-app \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=\$SONAR_HOST_URL \
                              -Dsonar.token=\$SONAR_AUTH_TOKEN
                        """
                    }
                }
            }
        }
        // ليه هنا بالتحديد: قبل ما نبني أي Docker image،
        // نفحص جودة الكود نفسه (bugs, code smells, duplications)

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        // ليه: لو الكود فشل معايير SonarQube (Quality Gate)،
        // الـ Pipeline يوقف هنا تلقائياً، وميوصلش لمرحلة البناء والنشر خالص

        stage('Build & Push - Cart') {
            when { environment name: 'CART_CHANGED', value: 'true' }
            steps {
                script {
                    dockerImage = docker.build("${REGISTRY}/cart:${env.BUILD_NUMBER}", "./Cart")

                    sh """
                        trivy image --severity HIGH,CRITICAL --exit-code 0 \
                          --format table ${REGISTRY}/cart:${env.BUILD_NUMBER}
                    """
                    // ليه --exit-code 0 دلوقتي: بيخلي الفحص "تحذيري" بس،
                    // يعني يوريك النتيجة في اللوج من غير ما يوقف الـ Pipeline
                    // بمجرد ما تشوف حجم المشاكل، ممكن نغيرها لـ --exit-code 1 لاحقاً

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

                    sh """
                        trivy image --severity HIGH,CRITICAL --exit-code 0 \
                          --format table ${REGISTRY}/product:${env.BUILD_NUMBER}
                    """

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

                    sh """
                        trivy image --severity HIGH,CRITICAL --exit-code 0 \
                          --format table ${REGISTRY}/user:${env.BUILD_NUMBER}
                    """

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
