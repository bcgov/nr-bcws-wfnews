import psycopg2

from config import config_db


def connect():
    """ Connect to the PostgreSQL database server """
    conn = None
    try:
        # read connection parameters
        params = config_db()

        # connect to the PostgreSQL server
        print('Connecting to the PostgreSQL database...')
        conn = psycopg2.connect(**params)

        # create a cursor
        cur = conn.cursor()

        # execute a statement
        print('PostgreSQL database version:')
        cur.execute('SELECT version()')

        # display the PostgreSQL database server version
        db_version = cur.fetchone()
        print(db_version)

        # close the communication with the PostgreSQL
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print('Database connection closed.')


def get_last_fetched_time_stamp(monitor_name):
    """ query data from the monitor_process_log table """
    conn = None
    last_fetched_time_stamp = None
    try:
        params = config_db()
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        cur.execute("""
            SELECT last_process_timestamp 
            FROM monitor_process_log 
            WHERE monitor_name = %s 
        """, (monitor_name,))
        print(f"The number of rows for {monitor_name} monitor: {cur.rowcount}")
        if cur.rowcount > 0:
            last_fetched_time_stamp = cur.fetchone()[0]

        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print("Failed to get record from monitor_process_log table", error)
    finally:
        if conn is not None:
            conn.close()

    return last_fetched_time_stamp


def insert_current_fetched_time_stamp(monitor_name, current_time_stamp):
    """ insert a new monitor last process time into the monitor_process_log table """
    sql = """
        INSERT INTO monitor_process_log(monitor_name, last_process_timestamp, revision_count, 
        create_user, create_timestamp, update_user, update_timestamp)
        VALUES(%s, %s, %s, %s, %s, %s, %s);
        """
    conn = None
    try:
        # read database configuration
        params = config_db()
        # connect to the PostgreSQL database
        conn = psycopg2.connect(**params)
        # create a new cursor
        cur = conn.cursor()
        # execute the INSERT statement
        record_to_insert = (monitor_name, current_time_stamp, 1, "COALESCE", current_time_stamp, "COALESCE",
                            current_time_stamp)
        cur.execute(sql, record_to_insert)
        # commit the changes to the database
        conn.commit()

        count = cur.rowcount
        print(count, "Record inserted successfully into monitor_process_log table")

        # close communication with the database
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print("Failed to insert record into monitor_process_log table", error)
    finally:
        if conn is not None:
            conn.close()


def update_last_fetched_time_stamp(monitor_name, current_time_stamp):
    """ update last_process_timestamp based on the monitor_name """
    sql = """
        UPDATE monitor_process_log
        SET last_process_timestamp = %s, update_timestamp = %s
        WHERE monitor_name = %s;
        """
    conn = None
    updated_rows = 0
    try:
        # read database configuration
        params = config_db()
        # connect to the PostgreSQL database
        conn = psycopg2.connect(**params)
        # create a new cursor
        cur = conn.cursor()
        # execute the UPDATE  statement
        cur.execute(sql, (current_time_stamp, current_time_stamp, monitor_name))
        # get the number of updated rows
        updated_rows = cur.rowcount
        # Commit the changes to the database
        conn.commit()

        print(updated_rows, "Record updated successfully in monitor_process_log table")

        # Close communication with the PostgreSQL database
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print("Failed to update record in monitor_process_log table", error)
    finally:
        if conn is not None:
            conn.close()

    return updated_rows
