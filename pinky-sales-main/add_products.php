<?php
include "header.php";

if (isset($_COOKIE['viewId'])) {
    $mode = 'view';
    $viewId = $_COOKIE['viewId'];
    $stmt = $obj->con1->prepare("SELECT * FROM `products` where id=?");
    $stmt->bind_param("i", $viewId);
    $stmt->execute();
    $Resp = $stmt->get_result();
    $data = $Resp->fetch_assoc();
    $stmt->close();
}

if(isset($_COOKIE['editId'])){
    $mode = 'edit';
    $editId = $_COOKIE['editId'];
    $stmt = $obj->con1->prepare("SELECT * FROM `products` where id=?");
    $stmt->bind_param("i", $editId);
    $stmt->execute();
    $Resp = $stmt->get_result();
    $data = $Resp->fetch_assoc();
    $stmt->close();
}

if(isset($_REQUEST['update'])){
    $editId = $_COOKIE['editId'];
    $name = $_REQUEST["product_name"];
    $company = $_REQUEST["product_company"];
    $price = $_REQUEST["product_price"];
    $product_category = $_REQUEST["product_category"];


    try{
        $stmt = $obj->con1->prepare("UPDATE `products` SET product_name=?, product_company=?, product_price=?, product_category=?  WHERE id=?");
        $stmt->bind_param("sssii", $name, $company, $price, $product_category, $editId);
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
        header("location:products.php");
    } else {
        setcookie("msg", "fail", time() + 3600, "/");
        header("location:products.php");
    }
}

if (isset($_REQUEST["save"])) {
    $name = $_REQUEST["product_name"];
    $company = $_REQUEST["product_company"];
    $price = $_REQUEST["product_price"];
    $product_category = $_REQUEST["product_category"];

    try {
        $stmt = $obj->con1->prepare("INSERT INTO `products`(`product_name`, `product_company`, `product_price`, `product_category`) VALUES (?,?,?,?)");
        $stmt->bind_param("sssi", $name, $company, $price, $product_category);
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
        header("location:products.php");
    } else {
        setcookie("msg", "fail", time() + 3600, "/");
        header("location:products.php");
    }
}
?>
<div class='p-6'>
    <div class="panel mt-2">
        <div class='flex items-center justify-between mb-3'>
            <h5 class="text-2xl text-primary font-semibold dark:text-white-light">
                Products - <?php echo isset($mode) ? ($mode == 'view' ? 'View' : ($mode == 'edit' ? 'Edit' : 'Add')) : 'Add'; ?>
            </h5>
        </div>
        <br/>
        <div class="mb-5">
            <form class="space-y-5" method="post" id="mainForm">
                <div>
                    <label for="product_name" class="font-bold">Product Name : </label>
                    <input id="product_name" name="product_name" type="text" class="form-input" value="<?php echo isset($mode) ? $data["product_name"] : ""; ?>" pattern="^\s*\S.*$" <?php echo isset($mode) && $mode == 'view' ? 'readonly' : ''?> required  onblur="// checkCategory(this, <?php // echo isset($mode) ? $data['id'] : 0 ?>)" />
                    <!-- <p class="mt-3 text-danger text-base font-bold" id="demo"></p> -->
                </div>
                <div>
                    <label for="product_company" class="font-bold">Product Company : </label>
                    <input id="product_company" name="product_company" type="text" class="form-input" <?php echo isset($mode) && $mode == 'view' ? 'readonly' : ''?> value="<?php echo isset($mode) ? $data["product_company"] : ""; ?>" pattern="^\s*\S.*$" required />
                </div>
                <div>
                    <label for="product_price" class="font-bold">Price : </label>
                    <input id="product_price" name="product_price" type="number" class="form-input" <?php echo isset($mode) && $mode == 'view' ? 'readonly' : ''?>  value="<?php echo isset($mode) ? $data["product_price"] : ""; ?>" required />
                </div>
                <div>
                    <label for="product_category" class="font-bold">Product Category </label>
                    <select name="product_category" id="product_category" class="form-select" <?php echo isset($mode) && $mode == 'view' ? 'disabled' : '' ?> required >
                        <option value="">Choose Product Category</option>
                        <?php
                            $query = $obj->con1->prepare("SELECT * FROM `product_category`");
                            $query->execute();
                            $Resp = $query->get_result();
                            while ($row = ((is_object($Resp) && method_exists($Resp, "fetch_array")) ? $Resp->fetch_array() : null)) {
                        ?>
                            <option value="<?php echo $row["id"]; ?>" <?php echo isset($mode) && $row["id"] == $data["product_category"] ? "selected" : ""?> >
                                <?php echo $row["category_name"]; ?>
                            </option>
                        <?php
                            }
                            $query->close();
                        ?>
                    </select>
                </div>
                <div class="relative inline-flex align-middle gap-3 mt-4">
                    <?php 
                        if(isset($mode) && $mode != 'view' || !isset($mode)) {
                    ?>
                        <button type="submit" name="<?php echo isset($mode) && $mode == 'edit' ? 'update' : 'save' ?>" id="save" class="btn btn-success" onclick="// return localValidate()">
                            <?php echo isset($mode) && $mode == 'edit' ? 'Update' : 'Save' ?>
                        </button>
                    <?php 
                        }
                    ?>
                    <button type="button" class="btn btn-danger" onclick="window.location='products.php'">Close</button>
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
