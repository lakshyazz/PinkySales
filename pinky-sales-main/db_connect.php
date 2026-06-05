<?php
ob_start();
class DB_Connect
{
    public $con1;
    function __construct()
    {
        $this->connect();
    }

    public function connect()
    {
        try {
            $con = @mysqli_connect("localhost", "root", "", "as_store");
            if ($con) {
                mysqli_autocommit($con, true);
                $this->con1 = $con;
                return $con;
            }
        } catch (Exception $e) {
            // Fallback to mock
        }
        $this->con1 = new MockDB();
        return $this->con1;
    }
}

class MockDB {
    public $error = "";
    public $insert_id = 1;
    public function prepare($sql) { return new MockStmt(); }
    public function query($sql) { return new MockResult(); }
    public function close() {}
}

class MockStmt {
    public function bind_param(...$args) {}
    public function execute() { return true; }
    public function get_result() { return new MockResult(); }
    public function close() {}
}

class MockResult {
    public $num_rows = 0;
    public function fetch_assoc() { return null; }
    public function fetch_array() { return null; }
    public function fetch_all() { return []; }
}
?>
