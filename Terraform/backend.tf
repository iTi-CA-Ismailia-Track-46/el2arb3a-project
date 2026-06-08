terraform {
  required_version = "1.15.2"

  backend "s3" {
    bucket       = "kubevision-tf-state-439328746854-us-east-1-an"
    key          = "haha/el2rb3a.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
