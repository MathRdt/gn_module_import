"""remove_archive_schema

Revision ID: 0ff8fc0b4233
Revises: 699c25251384
Create Date: 2022-05-12 09:39:45.951064

"""
import sqlalchemy as sa
from sqlalchemy.schema import Table, MetaData
from alembic import op
import pandas as pd

# revision identifiers, used by Alembic.
revision = '0ff8fc0b4233'
down_revision = 'cadfdaa42430'
branch_labels = None
depends_on = None

archive_schema = 'gn_import_archives'

def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn.engine)
    archive_tables = inspector.get_table_names(schema="gn_import_archives")
    metadata = MetaData(bind=op.get_bind())
    imprt = Table('t_imports', metadata, autoload=True, schema='gn_imports')
    for archive_table in archive_tables:
        #Read table with pandas
        arch_df = pd.read_sql_table(archive_table, con=conn, schema="gn_import_archives")
        op.execute(imprt.update()
                   .where(imprt.c.import_table==archive_table)
                   .values({'source_file': arch_df.to_csv(index=False).encode(),
                            'encoding': 'utf-8',
                            'separator': ',',
                            })
                   )
    tables = inspector.get_table_names(schema="gn_imports")
    for table in list(filter(lambda x: x.startswith('i_'), tables)):
        op.drop_table(table_name=table, schema="gn_imports")
    op.execute(f'DROP SCHEMA {archive_schema} CASCADE')
    op.execute("""
        ALTER TABLE gn_imports.t_imports
        DROP COLUMN import_table
    """)


def downgrade():
    op.execute(f'CREATE SCHEMA {archive_schema}')
    op.execute('''
        CREATE TABLE gn_import_archives.cor_import_archives(
          id_import integer NOT NULL,
          table_archive character varying(255) NOT NULL
        );
    ''')
    op.execute("""
            ALTER TABLE gn_imports.t_imports
            ADD COLUMN import_table character varying(255)
        """)