resource "aws_ecr_repository" "el2arb3a_project" {
  name                 = "el2arb3a-project"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = "Production"
    Project     = "el2arb3a-project"
  }
}