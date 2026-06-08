resource "aws_ecr_repository" "platform_api" {
  name                 = "platform-api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = "Production"
    Project     = "KubeVision-Serverless-Platform"
  }
}