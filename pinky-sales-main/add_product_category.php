<?php
include "header.php";

if (isset($_COOKIE['viewId'])) {
    $mode = 'view';
    $viewId = $_COOKIE['viewId'];
    $stmt = $obj->con1->prepare("SELECT * FROM `product_category` where id=?");
    $stmt->bind_param("i", $viewId);
    $stmt->execute();
    $Resp = $stmt->get_result();
    $data = $Resp->fetch_assoc();
    $stmt->close();
}

if(isset($_COOKIE['editId'])){
    $mode = 'edit';
    $editId = $_COOKIE['editId'];
    $stmt = $obj->con1->prepare("SELECT * FROM `product_category` where id=?");
    $stmt->bind_param("i", $editId);
    $stmt->execute();
    $Resp = $stmt->get_result();
    $data = $Resp->fetch_assoc();
    $stmt->close();
}

if(isset($_REQUEST['update'])){
    $editId = $_COOKIE['editId'];
    $category_name = $_REQUEST["category_name"];

    try{
        $stmt = $obj->con1->prepare("UPDATE `product_category` SET category_name=? WHERE id=?");
        $stmt->bind_param("si", $category_name, $editId);
        $Res = $stmt->execute();
        if (!$Res) {
            throw new Exception("Problem in updating! " . strtok($obj->con1->error, "("));
        }
        $stmt->close();
    } catch (\Exception $e) {
        setcookie("sql_error", urlencode($e->getMessage()), time() + 3600, "/");
    }

    if ($Res) {
        setcookie("msg", "update", time() + 3600, "/");
        header("location:product_category.php");
    } else {
        setcookie("msg", "fail", time() + 3600, "/");
        header("location:product_category.php");
    }
}

if (isset($_REQUEST["save"])) {
    $category_name = $_REQUEST["category_name"];
    try {
        $stmt = $obj->con1->prepare("INSERT INTO `product_category`(`category_name`) VALUES (?)");
        $stmt->bind_param("s", $category_name);
        $Resp = $stmt->execute();
        if (!$Resp) {
            throw new Exception("Problem in adding! " . strtok($obj->con1->error, "("));
        }
        $stmt->close();
    } catch (\Exception $e) {
        setcookie("sql_error", urlencode($e->getMessage()), time() + 3600, "/");
    }

    if ($Resp) {
        setcookie("msg", "data", time() + 3600, "/");
        header("location:product_category.php");
    } else {
        setcookie("msg", "fail", time() + 3600, "/");
        header("location:product_category.php");
    }
}
?>
<div class='p-6'>
    <div class="panel mt-2">
        <div class='flex items-center justify-between mb-3'>
            <h5 class="text-2xl text-primary font-semibold dark:text-white-light">
                Product Category - <?php echo isset($mode) ? ($mode == 'view' ? 'View' : ($mode == 'edit' ? 'Edit' : 'Add')) : 'Add'; ?>
            </h5>
        </div>
        <div class="mb-5">
            <form class="space-y-5" method="post" id="mainForm">
                <div>
                    <label for="category_name" class="font-bold">Category Name </label>
                    <input id="category_name" name="category_name" type="text" class="form-input" value="<?php echo isset($mode) ? $data["category_name"] : ""; ?>" pattern="^\s*\S.*$" <?php echo isset($mode) && $mode == 'view' ? 'readonly' : ''?> required  onblur="checkCategory(this, <?php echo isset($mode) ? $data['id'] : 0 ?>)" />
                    <p class="mt-3 text-danger text-base font-bold" id="demo"></p>
                </div>
                <div class="relative inline-flex align-middle gap-3 mt-4">
                    <?php 
                        if(isset($mode) && $mode != 'view' || !isset($mode)) {
                    ?>
                        <button type="submit" name="<?php echo isset($mode) && $mode == 'edit' ? 'update' : 'save' ?>" id="save" class="btn btn-success" onclick="return localValidate()">
                            <?php echo isset($mode) && $mode == 'edit' ? 'Update' : 'Save' ?>
                        </button>
                    <?php 
                        }
                    ?>
                    <button type="button" class="btn btn-danger" onclick="window.location='product_category.php'">Close</button>
                </div>
            </form>
        </div>
    </div>
</div>
<script>
    function localValidate(){
        let form = document.getElementById('mainForm');
        let submitButton = document.getElementById('save');
        let company = document.getElementById('category_name');

        if(form.checkValidity() && checkCategory(company, <?php echo isset($mode) ? $data['id'] : 0 ?>)){
            setTimeout(() => {
                submitButton.disabled = true;
            }, 0);
            return true;
        }
    }

    function checkCategory(c1, id){
        let name = c1.value;

        const obj = new XMLHttpRequest();
        obj.open("GET",`./ajax/check_category.php?name=${name}&id=${id}`, false);
        obj.send();

        if(obj.status == 200){
            let x = obj.responseText;
            if(x>=1){
                c1.value="";
                c1.focus();
                document.getElementById("demo").innerHTML = "Sorry the category already exist!";
                return false;
            } else{  
                document.getElementById("demo").innerHTML = "";
                return true;
            }
        }
    }

</script>


<?php
include "footer.php";
?>
