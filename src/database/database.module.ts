import { Module, Global } from '@nestjs/common';
import { sql } from '../config/db';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        try {
          await sql`
            CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              email VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              name VARCHAR(255),
              avatar VARCHAR(255),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
          console.log('Database initialized successfully');
          return sql;
        } catch (error) {
          console.error('Error initDb', error);
          throw error;
        }
      },
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}