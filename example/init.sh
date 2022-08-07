echo "INIT DB IMAGE"
docker-compose up -d || exit 1
echo "COPY DB DUMP TO IMAGE"
docker cp ./sql/dump.sql nest_transact_db:/db.sql || exit 1
echo "CLEARING OLD DB DATA"
docker exec nest_transact_db dropdb -U nest_transact_user -h localhost -p 5432 -f --if-exists nest_transact_db || exit 1
docker exec nest_transact_db createdb -U nest_transact_user -h localhost -p 5432 nest_transact_db || exit 1
echo "RESTORE INITIAL DATA"
echo "psql -U nest_transact_user -h localhost -p 5432 -d nest_transact_db </db.sql" >./restore.sh
docker cp ./restore.sh nest_transact_db:/restore.sh || exit 1
rm ./restore.sh
docker exec nest_transact_db bash -c "bash /restore.sh" || exit 1
echo "INITIAL DATA RESTORED; DB IMAGE READY TO USE"
