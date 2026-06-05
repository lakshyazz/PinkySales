<?php
$con = mysqli_connect("localhost", "root", "");
if (!$con) {
    die("Connection failed: " . mysqli_connect_error());
}
echo "Connected successfully\n";

$db_selected = mysqli_select_db($con, "as_store");
if (!$db_selected) {
    echo "Database as_store not found. Creating...\n";
    $sql = "CREATE DATABASE as_store";
    if (mysqli_query($con, $sql)) {
        echo "Database created successfully\n";
        mysqli_select_db($con, "as_store");
        
        // Create superadmin table
        $sql_table = "CREATE TABLE superadmin (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_name VARCHAR(30) NOT NULL,
            admin_password VARCHAR(50) NOT NULL,
            name VARCHAR(50)
        )";
        if(mysqli_query($con, $sql_table)) {
            echo "Table superadmin created successfully\n";
            // Insert admin user
            $sql_insert = "INSERT INTO superadmin (user_name, admin_password, name) VALUES ('admin', 'admin123', 'Super Admin')";
            mysqli_query($con, $sql_insert);
            echo "Admin user created successfully\n";
        }
    } else {
        echo "Error creating database: " . mysqli_error($con) . "\n";
    }
} else {
    echo "Database as_store exists.\n";
}
mysqli_close($con);
?>
