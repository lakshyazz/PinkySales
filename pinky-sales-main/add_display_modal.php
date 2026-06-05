<?php
include "header.php";

if (isset($_COOKIE['viewId'])) {
    $mode = 'view';
    $viewId = $_COOKIE['viewId'];
    $stmt = $obj->con1->prepare("SELECT * FROM `display_modals` where id=?");
    $stmt->bind_param("i", $viewId);
    $stmt->execute();
    $Resp = $stmt->get_result();
    $data = $Resp->fetch_assoc();
    $stmt->close();
}

if (isset($_COOKIE['editId'])) {
    $mode = 'edit';
    $editId = $_COOKIE['editId'];
    $stmt = $obj->con1->prepare("SELECT * FROM `display_modals` where id=?");
    $stmt->bind_param("i", $editId);
    $stmt->execute();
    $Resp = $stmt->get_result();
    $data = $Resp->fetch_assoc();
    $stmt->close();
}

if (isset($_REQUEST['update'])) {
    $modal_name = $_REQUEST["modal_name"];
    $company_id = $_REQUEST["company_name"];
    $manufacturer_id = $_REQUEST["manufacturer_name"];
    $price = $_REQUEST["price"];

    try {
        $stmt = $obj->con1->prepare("UPDATE `display_modals` SET modal_name=?, company_id=?, manufacturer_id=?, price=? WHERE id=?");
        $stmt->bind_param("siiii", $modal_name, $company_id, $manufacturer_id, $price, $editId);
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
        header("location:display_modal.php");
    } else {
        setcookie("msg", "fail", time() + 3600, "/");
        header("location:display_modal.php");
    }
}

if (isset($_REQUEST["save"])) {
    $modal_name = $_REQUEST["modal_name"];
    $company_id = $_REQUEST["company_name"];
    $price = $_REQUEST["price"];
    $manufacturer_id = $_REQUEST["manufacturer_name"];

    try {
        $stmt = $obj->con1->prepare("INSERT INTO `display_modals` (`modal_name`, `company_id`, `manufacturer_id`, `price`) VALUES (?,?,?,?)");
        $stmt->bind_param("siis", $modal_name, $company_id, $manufacturer_id, $price);
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
        header("location:display_modal.php");
    } else {
        setcookie("msg", "fail", time() + 3600, "/");
        header("location:display_modal.php");
    }
}
?>
<div class='p-6'>
    <div class="panel mt-2">
        <div class='flex items-center justify-between mb-3'>
            <h5 class="text-2xl text-primary font-semibold dark:text-white-light">
                Display Modal -
                <?php echo isset($mode) ? ($mode == 'view' ? 'View' : ($mode == 'edit' ? 'Edit' : 'Add')) : 'Add'; ?>
            </h5>
        </div>
        <div class="mb-5">
            <form class="space-y-5" method="post" id="mainForm">
                <div>
                    <label for="modal_name" class="font-bold">Display Modal Name </label>
                    <input id="modal_name" name="modal_name" type="text" class="form-input"
                        value="<?php echo isset($mode) ? $data["modal_name"] : ""; ?>" pattern="^\s*\S.*$" <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?> required />
                    <p class="mt-3 text-danger text-base font-bold" id="demo"></p>
                </div>
                <div>
                    <label for="price" class="font-bold">Modal Price </label>
                    <input id="price" name="price" type="text" class="form-input"
                        value="<?php echo isset($mode) ? $data["price"] : ""; ?>" pattern="^\s*\S.*$" <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?> required onblur="" />
                    <p class="mt-3 text-danger text-base font-bold" id="demo"></p>
                </div>
                <div>
                    <label for="company_name" class="font-bold">Display Company </label>
                    <select name="company_name" id="company_name" class="form-select" <?php echo isset($mode) && $mode == 'view' ? 'disabled' : '' ?> required>
                        <option value="">Choose Display Company</option>
                        <?php
                            $query = $obj->con1->prepare("SELECT * FROM `mobile_companies`");
                            $query->execute();
                            $Resp = $query->get_result();
                            while ($row = ((is_object($Resp) && method_exists($Resp, "fetch_array")) ? $Resp->fetch_array() : null)) {
                        ?>
                            <option value="<?php echo $row["id"]; ?>" <?php echo isset($mode) && $row["id"] == $data["company_id"] ? "selected" : "" ?>>
                                <?php echo $row["name"]; ?>
                            </option>
                        <?php
                            }
                            $query->close();
                        ?>
                    </select>
                </div>
                <div>
                    <label for="manufacturer_name" class="font-bold">Manufacturer Company </label>
                    <select name="manufacturer_name" id="manufacturer_name" class="form-select" <?php echo isset($mode) && $mode == 'view' ? 'disabled' : '' ?> required>
                        <option value="">Choose Display Company</option>
                        <?php
                        $query = $obj->con1->prepare("SELECT * FROM `manufacturer_companies`");
                        $query->execute();
                        $Resp = $query->get_result();
                        while ($row = ((is_object($Resp) && method_exists($Resp, "fetch_array")) ? $Resp->fetch_array() : null)) {
                            ?>
                            <option value="<?php echo $row["id"]; ?>" <?php echo isset($mode) && $row['id'] == $data['manufacturer_id'] ? 'selected' : '' ?>>
                                <?php echo $row["manufacturer_name"]; ?>
                            </option>
                            <?php
                        }
                        $query->close();
                        ?>
                    </select>
                </div>

                <div class="relative inline-flex align-middle gap-3 mt-4">
                    <?php
                    if (isset($mode) && $mode != 'view' || !isset($mode)) {
                        ?>
                        <button type="submit" name="<?php echo isset($mode) && $mode == 'edit' ? 'update' : 'save' ?>"
                            id="save" class="btn btn-success" onclick="return localValidate()">
                            <?php echo isset($mode) && $mode == 'edit' ? 'Update' : 'Save' ?>
                        </button>
                        <?php
                    }
                    ?>
                    <button type="button" class="btn btn-danger"
                        onclick="window.location='display_modal.php'">Close</button>
                </div>
            </form>
        </div>
    </div>
</div>
<script>
    function localValidate() {
        let form = document.getElementById('mainForm');
        let submitButton = document.getElementById('save');
        let company = document.getElementById('company_name');

        if (form.checkValidity() && checkCompany(company, <?php echo isset($mode) ? $data['id'] : 0 ?>)) {
            setTimeout(() => {
                submitButton.disabled = true;
            }, 0);
            return true;
        }
    }

    function checkCompany(c1, id) {
        let name = c1.value;

        const obj = new XMLHttpRequest();
        obj.open("GET", `./ajax/check_company.php?name=${name}&id=${id}`, false);
        obj.send();

        if (obj.status == 200) {
            let x = obj.responseText;
            if (x >= 1) {
                c1.value = "";
                c1.focus();
                document.getElementById("demo").innerHTML = "Sorry the company already exist!";
                return false;
            } else {
                document.getElementById("demo").innerHTML = "";
                return true;
            }
        }
    }

</script>


<?php
include "footer.php";
?>
