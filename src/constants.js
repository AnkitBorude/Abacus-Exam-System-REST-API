import config from 'config';

export const DB_NAME=config.get("DB.name");
export const MIN_USERNAME_LENGTH=8;
export const MAX_USERNAME_LENGTH=16;