#!/usr/bin/env/bash
git clone https://github.com/kclowes/py-ipfs-http-client.git
cd py-ipfs-http-client
flit install --pth-file --python ../venv/bin/python
