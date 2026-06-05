<?php
	include "../db_connect.php";
	$obj = new DB_Connect();
    
    $name = $_REQUEST["name"];
    $id = $_REQUEST["id"];

    $stmt = $obj->con1->prepare("SELECT count(*) AS total FROM product_category WHERE soundex(category_name)=soundex(?) AND id!=?");
    $stmt->bind_param("si", $name, $id);
    $stmt->execute();
    $data = $stmt->get_result()->fetch_assoc();
    echo $data["total"];
    $stmt->close();
?>
