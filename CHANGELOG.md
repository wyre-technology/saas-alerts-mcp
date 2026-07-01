# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `/health` liveness endpoint now returns an unconditional `200` instead of `503`
  when no credentials are present. The Azure Container Apps liveness probe calls
  `GET /health` without credentials, so gating the status code on credentials
  caused the probe to fail and ACA to crash-loop the container. Credential
  presence is still reported in the response body (`credentials.configured`).
  The request-scoped credential handling for `/mcp` is unchanged.
