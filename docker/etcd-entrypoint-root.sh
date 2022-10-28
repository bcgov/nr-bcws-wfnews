#!/bin/bash
chown -R etcd /bitnami/etcd/
runuser etcd /opt/bitnami/scripts/etcd/setup.sh
runuser etcd /opt/bitnami/scripts/etcd/run.sh