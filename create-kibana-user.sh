#!/bin/bash

# Wait for Elasticsearch to be ready
echo "Waiting for Elasticsearch to start..."
until curl -s "http://localhost:9200" > /dev/null; do
  sleep 5
done

# Check if kibana_service_role exists and delete it if necessary
echo "Checking if kibana_service_role exists..."
role_check=$(curl -s -o /dev/null -w "%{http_code}" "http://elastic:prashanta0234@localhost:9200/_security/role/kibana_service_role")
if [ "$role_check" -eq 200 ]; then
  echo "Role kibana_service_role exists, deleting..."
  curl -X DELETE "http://elastic:prashanta0234@localhost:9200/_security/role/kibana_service_role"
else
  echo "Role kibana_service_role does not exist."
fi

# Create the kibana_service role with specific permissions for system indices
echo "Creating kibana_service role..."
curl -X POST "http://elastic:prashanta0234@localhost:9200/_security/role/kibana_service_role" -H 'Content-Type: application/json' -d'
{
  "cluster": ["all"],
  "index": [
    {
      "names": [".kibana", ".kibana_*"],
      "privileges": ["view_index_metadata", "manage", "read", "write"]
    }
  ]
}
'

# Check if kibana_service user exists and delete it if necessary
echo "Checking if kibana_service user exists..."
user_check=$(curl -s -o /dev/null -w "%{http_code}" "http://elastic:prashanta0234@localhost:9200/_security/user/kibana_service")
if [ "$user_check" -eq 200 ]; then
  echo "User kibana_service exists, deleting..."
  curl -X DELETE "http://elastic:prashanta0234@localhost:9200/_security/user/kibana_service"
else
  echo "User kibana_service does not exist."
fi

# Create the kibana_service user and assign the kibana_service_role
echo "Creating kibana_service user..."
curl -X POST "http://elastic:prashanta0234@localhost:9200/_security/user/kibana_service" -H 'Content-Type: application/json' -d'
{
  "password" : "prashanta0234",
  "roles" : ["kibana_service_role"]
}
'

echo "Kibana service account created successfully!"
