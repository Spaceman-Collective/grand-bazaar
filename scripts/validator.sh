#!/bin/bash

anchor build
solana-test-validator -r \
    --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s ./deps/mpl_token_metadata.so \
    --bpf-program cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK ./deps/spl_account_compression.so \
    --bpf-program noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV ./deps/spl_noop.so \
    --bpf-program BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY ./deps/bubblegum.so \
    --bpf-program "BXNayNJzpQoWuAmXbj5gVMAAxVR8HqZWCtokuZM3kVAZ" ./target/deploy/grand_bazaar.so
