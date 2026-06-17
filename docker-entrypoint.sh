#!/bin/sh

echo "Running Prisma..."

until npx prisma db push
do
  echo "Database not ready..."
  sleep 2
done

echo "Prisma complete"

exec pnpm run dev
