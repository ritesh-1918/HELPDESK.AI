exports.up = async (knex) => {
  await knex.schema.createTable('roles', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.json('permissions').notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('roles');
};