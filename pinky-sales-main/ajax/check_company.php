<?php
	include "../db_connect.php";
	$obj = new DB_Connect();
    
    $name = $_REQUEST["name"];
    $id = $_REQUEST["id"];

    $stmt = $obj->con1->prepare("SELECT count(*) as total FROM mobile_companies WHERE soundex(name)=soundex(?) AND id!=?");
    $stmt->bind_param("si", $name, $id);
    $stmt->execute();
    $data = $stmt->get_result()->fetch_assoc();
    echo $data["total"];
    $stmt->close();
?>
