<?php
include "header.php";
require_once('Mail/PHPMailer_v5.1/class.phpmailer.php');

if (isset($_COOKIE['viewId'])) {
    $mode = 'view';
    $viewId = $_COOKIE['viewId'];
    $stmt = $obj->con1->prepare("SELECT c1.*, s1.name as service_type_name FROM `customer_reg` c1, service_type s1 WHERE c1.service_type=s1.id AND c1.id=?");
    $stmt->bind_param("i", $viewId);
    $stmt->execute();
    $Resp = $stmt->get_result();
    $data = $Resp->fetch_assoc();
    $stmt->close();
}

if (isset($_COOKIE['editId'])) {
    $mode = 'edit';
    $editId = $_COOKIE['editId'];
    $stmt = $obj->con1->prepare("SELECT * FROM `customer_reg` where id=?");
    $stmt->bind_param('i', $editId);
    $stmt->execute();
    $Resp = $stmt->get_result();
    $data = $Resp->fetch_assoc();
    $stmt->close();
}

if (isset($_REQUEST['update'])) {
    $editId = $_COOKIE['editId'];
    $fname = $_REQUEST['fname'];
    $lname = $_REQUEST['lname'];
    $email = $_REQUEST['mail'];
    $contact = $_REQUEST['contact_num'];
    $alt_contact = $_REQUEST['alt_contact_num'];
    $map_location = $_REQUEST['map_location'];
    $address = $_REQUEST['address'];
    $pincode = $_REQUEST['pincode'];
    $service_type = $_REQUEST['service_type'];
    $product_category = $_REQUEST['product_category'];
    $dealer_name = $_REQUEST['dealer_name'];
    $complaint_date = $_REQUEST['complaint_date'];
    $complaint_time = date('h:i A', strtotime($_REQUEST['complaint_time']));
    $complaint_no = $data['complaint_no'];
    $description = $_REQUEST['description'];
    $barcode = $_REQUEST['barcode'];

    $stmt = $obj->con1->prepare("UPDATE `customer_reg` SET fname=?,lname=?,email=?,contact=?,alternate_contact=?,map_location=?,address=?,zipcode=?,complaint_no=?,service_type=?,product_category=?,dealer_name=?,description=?, barcode=?, date=?, time=?  WHERE id=?");
    $stmt->bind_param("ssssssssssisssssi", $fname, $lname, $email, $contact, $alt_contact, $map_location, $address, $pincode, $complaint_no, $service_type, $product_category, $dealer_name, $description, $barcode, $complaint_date, $complaint_time, $editId);
    $Res = $stmt->execute();
    $stmt->close();

    if ($Res) {
        setcookie("msg", "update", time() + 3600, "/");
        header("location:complaint_demo.php");
    } else {
        setcookie("msg", "fail", time() + 3600, "/");
        header("location:complaint_demo.php");
    }
}

if (isset($_POST['save'])) {
    $fname = $_REQUEST['fname'];
    $lname = $_REQUEST['lname'];
    $email = $_REQUEST['mail'];
    $contact = $_REQUEST['contact_num'];
    $alt_contact = $_REQUEST['alt_contact_num'];
    $map_location = $_REQUEST['map_location'];
    $address = $_REQUEST['address'];
    $pincode = $_REQUEST['pincode'];
    $product_category = $_REQUEST['product_category'];
    $service_type = $_REQUEST['service_type'];
    $dealer_name = $_REQUEST['dealer_name'];
    $complaint_date = $_REQUEST['complaint_date'];
    $complaint_time = date('h:i A', strtotime($_REQUEST['complaint_time']));
    $description = $_REQUEST['description'];
    $barcode = $_REQUEST['barcode'];
    $source = "web";
    $joined_date = date("dmy", strtotime($complaint_date));

    // get max customer id - added by Rachna
    // $stmt = $obj->con1->prepare("select IFNULL(count(id)+1,1) as customer_id from customer_reg where date ='" . date("Y-m-d", strtotime($complaint_date)) . "'");


    function checkBarcode($barcode,$service_type,$product_category, $obj) //added by jay 30-03-24
    {
        if($barcode!="")
        {
            $stmt = $obj->con1->prepare("SELECT  product_category FROM `customer_reg` WHERE barcode=?");
            $stmt->bind_param("s", $barcode);
            $stmt->execute();
           
            if($row = $stmt->get_result()->fetch_assoc())
            {
            
                if($product_category!=$row["product_category"])
                {
                    return -2;
                }
            }    
            
             $stmt->close();
        }
       if($service_type==23 && $barcode!="")
       {
            $stmt = $obj->con1->prepare("SELECT count(*) as cnt FROM `customer_reg` WHERE barcode=? and warranty=2");
            $stmt->bind_param("s", $barcode);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            return $row["cnt"]; 
            
       }
       else if($barcode=="" && $service_type==23)
       {
            return -1;
       }
       
       
       return 0;
    
    }
    


    try {
        if($barcode!=""){
            $stmt = $obj->con1->prepare("SELECT * FROM `customer_reg` WHERE barcode=?");
            $stmt->bind_param("s", $barcode);
            $stmt->execute();
            if($row = $stmt->get_result()->fetch_assoc()){
                echo var_dump($row);
                if($product_category!=$row["product_category"]){
                    setcookie("msg", "other-product", time() + 3600, "/");
                    header("location:add_complaint_demo.php");
                    exit();
                }
            }
            $stmt->close();

            if($service_type==23){
                $stmt = $obj->con1->prepare("SELECT count(*) as cnt FROM `customer_reg` WHERE barcode=? AND warranty=2");
                $stmt->bind_param("s", $barcode);
                $stmt->execute();
                $row = $stmt->get_result()->fetch_assoc();
                $stmt->close();
                if($row["cnt"] >= 1){
                    setcookie("msg", "warranty", time() + 3600, "/");
                    header("location:add_complaint_demo.php");
                    exit();
                }
            }
        } else if($barcode=="" && $service_type==23){
            setcookie("msg", "barcode", time() + 3600, "/");
            header("location:add_complaint_demo.php");
        }
    } catch (\Exception $e) {
        setcookie("sql_error", urlencode($e->getMessage()), time() + 3600, "/");
    }

    $stmt = $obj->con1->prepare("select 10000-(9999-right(complaint_no,4)) as customer_id from customer_reg where date='".date("Y-m-d")."' order by id desc limit 1");
    $stmt->execute();
    $row_dailycounter = $stmt->get_result()->fetch_assoc();
    $stmt->close();
 
    if(!isset($row_dailycounter["customer_id"])){
        $dailycounter = 1;
    } else {
        $dailycounter = (int) $row_dailycounter["customer_id"];
    }
    $string = str_pad($dailycounter, 4, '0', STR_PAD_LEFT);
    $complaint_no = "ONL" . $joined_date . $string;

    //--------------//
    $new_complaint_date = date("Y-m-d", strtotime($complaint_date));
    
    try {
        // allocate call - added by Rachna
        // ------- get city by anant
        $stmt = $obj->con1->prepare("SELECT c1.ctnm,a1.* FROM area_pincode a1, city c1 WHERE a1.city_id=c1.srno AND a1.pincode=?");
        $stmt->bind_param("s", $pincode);
        $stmt->execute();
        $res_area=$stmt->get_result();
        $num_area=$res_area->num_rows;
        $city_data = $res_area->fetch_assoc();
        if($num_area>0)
        {
            $fetched_city_id = $city_data["city_id"];
        }
        else{
            $fetched_city_id = 0;
        }
        $stmt->close();

        if(trim($barcode) != ""){
            $stmt = $obj->con1->prepare("SELECT * FROM customer_reg WHERE barcode=? AND service_type=23 AND product_category=?");
            $stmt->bind_param("si", $barcode, $product_category);
            $stmt->execute();
            $Res = $stmt->get_result();
            $war_data = $Res->fetch_assoc();
            $stmt->close();

            if($Res->num_rows >= 1){
                $pr_category = $war_data['product_category'];

                $stmt = $obj->con1->prepare("SELECT * FROM product_category WHERE id=?");
                $stmt->bind_param("i", $pr_category);
                $stmt->execute();
                $Resi = $stmt->get_result();
                $pr_data = $Resi->fetch_assoc();
                $stmt->close();
                
                $old_date = strtotime($war_data['date']);
                $check_date = strtotime($new_complaint_date);
                $warranty_period = $pr_data['warranty_period'];

                $difference = $check_date - $old_date;
                $warranty_duration = $warranty_period * 30 * 24 * 60 * 60;

                if($difference <= $warranty_duration){
                    $warranty_status = 1;
                } else {
                    $warranty_status = 0;
                }
            } else if($service_type != 23 && trim($barcode) != "") {
                $warranty_status = 3;
            } else {
                $warranty_status = 2;
            }
        } else {
            $warranty_status = 3;
        }

        $stmt = $obj->con1->prepare("INSERT INTO `customer_reg`(`fname`, `lname`, `email`, `contact`, `alternate_contact`, `area`, `map_location`, `address`, `zipcode`, `complaint_no`, `service_type`, `product_category`, `dealer_name`, `description`, `barcode`, `source`, `warranty`, `date`, `time`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
        $stmt->bind_param("sssssissssiissssiss", $fname, $lname, $email, $contact, $alt_contact, $fetched_city_id, $map_location, $address, $pincode, $complaint_no, $service_type, $product_category, $dealer_name, $description, $barcode, $source, $warranty_status, $new_complaint_date, $complaint_time);
        $Resp = $stmt->execute();
        $stmt->close();

        if(!$Resp){
            throw new Exception("Problem in adding! " . strtok($obj->con1->error, '('));
        }

        // echo "<br/> Insert Customer_reg :- INSERT INTO `customer_reg`(`fname`, `lname`, `email`, `contact`, `alternate_contact`, `map_location`, `address`, `zipcode`, `complaint_no`, `service_type`, `product_category`, `dealer_name`, `description`, `barcode`,`source`, `date`, `time`) VALUES (". $fname.", ". $lname.", ". $email.", ". $contact.", ". $alt_contact.", ". $map_location.", ". $address.", ". $pincode.", ". $complaint_no.", ". $service_type.", ". $product_category.", ". $dealer_name.", ". $description.", ". $barcode.", ". $source.", ". $new_complaint_date.", ". $complaint_time.")";

        // ------- get service center from city by anant
        
        // if($warranty_status != 2 && $service_type != 16){
            $stmt = $obj->con1->prepare("SELECT * FROM `service_center` WHERE area=?");
            $stmt->bind_param("i", $fetched_city_id);
            $stmt->execute();
            $service_center = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            // insert into call allocation
            $product_serial_no = "";
            $product_model = "";
            $purchase_date = "";
            $techinician = 0;
            $allocation_date = "";
            $allocation_time = "";
            $status = "new";
            //---------------//

            $stmt = $obj->con1->prepare("INSERT INTO `call_allocation`(`complaint_no`, `service_center_id`, `product_serial_no`, `product_model`, `purchase_date`, `technician`, `allocation_date`, `allocation_time`, `status`) VALUES (?,?,?,?,?,?,?,?,?)");
            $stmt->bind_param("sisssisss", $complaint_no, $service_center["id"], $product_serial_no, $product_model, $purchase_date, $techinician, $allocation_date, $allocation_time, $status);
            $result = $stmt->execute();
            $stmt->close();
        // }

        //  echo "<br/> Insert Call allocation :- INSERT INTO `call_allocation`(`complaint_no`, `service_center_id`, `product_serial_no`, `product_model`, `purchase_date`, `technician`, `allocation_date`, `allocation_time`, `status`) VALUES (" . $complaint_no . " " . $service_center['id'] . " " . $product_serial_no . " " . $product_model . " " . $purchase_date . " " . $techinician . " " . $allocation_date . " " . $allocation_time . " " . $status . ")";

        $stmt = $obj->con1->prepare("SELECT name FROM service_type WHERE id=?");
        $stmt->bind_param("i", $service_type);
        $Name = $stmt->execute();
        $service = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        $noti_msg = "New Complaint recieved ";
        $noti_type = $service['name'];
        $admin_status = isset($_SESSION['type_admin']) ? 1 : 0;
        $admin_play_status = 1;
        $service_status = 1;
        $service_play_status = 1;

        $stmt = $obj->con1->prepare("INSERT INTO `notification`(`complaint_no`, `type`, `msg`, `admin_status`, `admin_play_status`, `service_status`, `service_play_status`) VALUES (?,?,?,?,?,?,?)");
        $stmt->bind_param("sssiiii", $complaint_no, $noti_type, $noti_msg, $admin_status, $admin_play_status, $service_status, $service_play_status);
        $Response = $stmt->execute();
        $stmt->close();

        if(!$Response){
            echo $obj->con1->error;
            throw new Exception("Problem in adding! " . strtok($obj->con1->error, '('));
        }

        $stmt = $obj->con1->prepare("INSERT INTO `send_mail` (`complaint_no`) VALUES (?)");
        $stmt->bind_param("s", $complaint_no);
        $Mail_res = $stmt->execute();
        $stmt->close();

        if($Mail_res){
            setcookie("mail", "successfull", time() + 3600, "/");
        } else {
            setcookie("mail", urlencode($mail_res), time() + 3600, "/");
        }
        
        // $subject = "Onelife Complaint Registered: " . $complaint_no;
        // $body = "
        // <h1>
        // Dear <b>$fname $lname</b>,
        // Your complaint has been registered successfully. Your complaint number is : <b>$complaint_no</b>
        // Techinician will be allocated soon.
        
        // Regards,
        // OneLife Team.
        // </h1>";
        // $from = "test@pragmanxt.com";
        // $from_name = "Onelife";

        // $mail_res = smtpmailer($subject, $body, $email, $from, $from_name);
        // if($mail_res == 1){
        //     setcookie("mail", "successfull", time() + 3600, "/");
        // } else {
        //     setcookie("mail", urlencode($mail_res), time() + 3600, "/");
        // }

        if (!$Resp) {
            echo $obj->con1->error;
            throw new Exception("Problem in adding! " . strtok($obj->con1->error, '('));
        }
    } catch (\Exception $e) {
        setcookie("sql_error", urlencode($e->getMessage()), time() + 3600, "/");
        echo "<br/>".urlencode($e->getMessage());
    }

    if ($Resp) {
        setcookie("msg", "data", time() + 3600, "/");
        header("location:complaint_demo.php");
    } else {
        setcookie("msg", "fail", time() + 3600, "/");
        header("location:complaint_demo.php");
    }
}

// function smtpmailer($subject, $body, $to, $from, $from_name){
//     global $error;
//     $mail = new PHPMailer();
//     $mail->IsSMTP();
//     $mail->SMTPAuth = true;
   
//     $mail->SMTPKeepAlive = true;
//     $mail->Mailer = "smtp";
   
//     $mail->Host = 'mail.pragmanxt.com';
//     $mail->Port = 465;
//     $mail->SMTPSecure = 'ssl';
//     $mail->Username = $from;
//     $mail->Password = "Pragma@12345";

//     $mail->IsHTML(true);
//     $mail->SMTPDebug = 1;
   
//     $mail->From = $from;
//     $mail->FromName = $from_name;
//     $mail->Sender = $from; // indicates ReturnPath header
//     $mail->AddReplyTo($from, $from_name); // indicates ReplyTo headers

//     $mail->Subject = $subject;
//     $mail->Body = $body;
//     $mail->AddAddress($to);

//     $mail->Timeout = 60;

//     if (!$mail->Send()) {
//         $error = 'Mail error: ' . $mail->ErrorInfo;
//         echo $error;
//         return $error;
//     } else {
//         $error = 'Message sent!';
//         echo $error;
//         return "1";
//     }
// }
?>

<div class='p-6'>
    <div class="panel mt-2">
        <div class='flex items-center justify-between mb-5'>
            <h5 class="text-2xl text-primary font-semibold dark:text-white-light">Complaint / Demo -
                <?php echo isset($mode) ? ($mode == 'view' ? 'View' : ($mode == 'edit' ? 'Edit' : 'Add')) : 'Add'; ?>
            </h5>
        </div>
        <div class="mb-5">
            <form method="post" id="mainForm" enctype="multipart/form-data">
                <div class="flex flex-wrap mb-1">
                    <div class="w-6/12 px-3 space-y-5">
                        <div>
                            <label for="fname"> First Name </label>
                            <input name="fname" id="fname" type="text" class="form-input" value="<?php echo isset($mode) ? $data['fname'] : '' ?>" required <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?> />
                        </div>
                        <div>
                            <label for="lname"> Last Name </label>
                            <input name="lname" id="lname" type="text" class="form-input" value="<?php echo isset($mode) ? $data['lname'] : '' ?>" required <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?> />
                        </div>
                        <div>
                            <label for="mail">Email</label>
                            <input name="mail" id="mail" type="email" class="form-input" pattern="^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$" title="Invalid Email Format" value="<?php echo isset($mode) ? $data['email'] : '' ?>" required <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?> />
                        </div>
                        <div>
                            <label for="contact_num">Contact </label>
                            <div class="flex">
                                <div class="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-[#e0e6ed] dark:border-[#17263c] dark:bg-[#1b2e4b]">+91</div>
                                <input name="contact_num" id="contact_num" type="tel" class="form-input ltr:rounded-l-none rtl:rounded-r-none" onkeypress="return event.charCode >= 48 && event.charCode <= 57" value="<?php echo isset($mode) ? $data['contact'] : '' ?>" <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?> maxlength="10" minlength="10" pattern="[0-9]+" title="Please enter numbers only" required />
                            </div>
                        </div>
                        <div>
                            <label for="alt_contact_num"> Alternate Contact </label>
                            <div class="flex">
                                <div class="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-[#e0e6ed] dark:border-[#17263c] dark:bg-[#1b2e4b]">+91</div>
                                <input name="alt_contact_num" id="alt_contact_num" type="tel" class="form-input ltr:rounded-l-none rtl:rounded-r-none"
                                    onkeypress="return event.charCode >= 48 && event.charCode <= 57" value="<?php echo isset($mode) ? $data['alternate_contact'] : '' ?>" <?php echo isset ($mode) && $mode == 'view' ? 'readonly' : '' ?> maxlength="10" minlength="10" pattern="[0-9]+" title="Please enter numbers only" />
                            </div>
                        </div>
                        <div>
                            <label for="address">Address </label>
                            <textarea autocomplete="on" name="address" id="address" class="form-textarea" rows="2"
                                value="" required <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?>><?php echo isset($mode) ? $data['address'] : '' ?></textarea>
                        </div>
                        <div>
                            <label for="pincode"> Pincode </label>
                            <input name="pincode" id="pincode" type="text" class="form-input" pattern="^[1-9][0-9]{5}$" title="enter valid pincode" maxlength="6" required onkeypress="return event.charCode >= 48 && event.charCode <= 57" value="<?php echo isset($mode) ? $data['zipcode'] : '' ?>"  onblur="<?php echo isset($_SESSION['type_center']) ? 'checkPincode(this)' : '' ?>" <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?> />
                            <p class="mt-3 text-danger text-base font-bold" id="demo"></p>
                        </div>
                    </div>
                    <div class="w-6/12 px-3 space-y-5">
                        <div>
                            <label for="product_category">Product Category </label>
                            <select name="product_category" id="product_category" class="form-select" <?php echo isset($mode) && $mode == 'view' ? 'disabled' : ''?> required onchange="getServiceType(this.value)">
                                <option value="">Choose Product Category</option>
                                <?php
                                    $query = $obj->con1->prepare("SELECT * FROM `product_category`");
                                    $query->execute();
                                    $Resp = $query->get_result();
                                    while ($row = ((is_object($Resp) && method_exists($Resp, "fetch_array")) ? $Resp->fetch_array() : null)) {
                                        ?>
                                            <option value="<?php echo $row["id"]; ?>" <?php echo isset($mode) && $row['id'] == $data['product_category'] ? 'selected' : '' ?>>
                                                <?php echo $row["name"]; ?>
                                            </option>
                                        <?php
                                    }
                                    $query->close();
                                ?>
                            </select>
                        </div>
                        <div>
                            <label for="service_type"> Service Type </label>
                            <select name="service_type" id="service_type" class="form-select" required <?php echo isset($mode) && $mode == 'view' ? 'disabled' : ''?> onchange="requireBarcode(this, 'barcode');">
                                <option value=""><?php echo isset($mode) && $mode == 'view' ? $data["service_type_name"] : 'Choose Service Type' ?></option>
                            </select>
                        </div>
                        <div>
                            <label for="description">Description </label>
                            <textarea autocomplete="on" row="2" name="description" id="description" class="form-input" required <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?>><?php echo isset($mode) ? $data['description'] : '' ?></textarea>
                        </div>
                        <div>
                            <label for="dealer_name">Dealer Name </label>
                            <input name="dealer_name" id="dealer_name" type="text" class="form-input" value="<?php echo isset($mode) ? $data['dealer_name'] : '' ?>" required <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?> />
                        </div>
                        <div>
                            <label for="barcode">Barcode </label>
                            <input name="barcode" id="barcode" type="text" class="form-input" value="<?php echo isset($mode) ? $data['barcode'] : '' ?>" <?php echo isset($mode) && $mode == 'view' ? 'readonly' : '' ?> onblur="checkWarranty(this, 'complaint_date', 'service_type', 'product_category')" />
                            <h6 id="warranty_status" class="text-lg mt-2"></h6>
                        </div>
                        <div x-data="cmplnDate">
                            <label>Date </label>
                            <input x-model="date2" name="complaint_date" id="complaint_date" class="form-input" required <?php echo isset($mode) && $mode == 'view' ? 'disabled' : '' ?> />
                        </div>
                        <div x-data="complaintTime">
                            <label>Time </label>
                            <input name="complaint_time" id="complaint_time" class="form-input" required <?php echo isset($mode) && $mode == 'view' ? 'disabled' : '' ?> />
                        </div>
                    </div>
                </div>
                <div class="relative inline-flex align-middle gap-3 mt-4">
                    <?php if(isset($mode) && $mode != "view" || !isset($mode)){ ?>
                        <!-- Save/Update button -->
                        <button type="submit" name="<?php echo isset($mode) && $mode == 'edit' ? 'update' : 'save' ?>" id="save" class="btn btn-success" onclick="return validateAndDisable()">
                            <?php echo isset($mode) && $mode == 'edit' ? 'Update' : 'Save' ?>
                        </button>
                    <?php } ?>
                    <!-- Close button -->
                    <button type="button" class="btn btn-danger" onclick="window.location='complaint_demo.php'">
                        Close
                    </button>
                </div>
                <!------ Hidden Inputs ------>
                <input type="hidden" name="map_location" id="map_location">
            </form>
        </div>
    </div>
</div>


<script>
    function resetForm() {
        window.location = "complaint_demo.php";
    }

    function checkWarranty(bar, input, serviceIp, proIp){
        let warrantyStatus = document.getElementById("warranty_status");
        let date = document.getElementById(input).value;
        let serviceType = document.getElementById(serviceIp).value;
        let productCategory = document.getElementById(proIp).value;
        let barcode = bar.value;

        if(!barcode.trim()) return;

        const http = new XMLHttpRequest();
        http.onload = () => {
            const warranty = http.responseText;
            if(warranty == "new-entry"){
                warrantyStatus.innerHTML = "";
                return;
            } else if(warranty == "not-in-warranty"){
                warrantyStatus.classList.add('text-danger');
                warrantyStatus.classList.remove('text-success');
                warrantyStatus.innerHTML = "Product is out of Warranty period";
            } else if(warranty == "in-warranty"){
                warrantyStatus.classList.add('text-success');
                warrantyStatus.classList.remove('text-danger');
                warrantyStatus.innerHTML = "Product is in Warranty period";
            }
        }
        http.open("GET", `./ajax/check_warranty.php?date=${date}&barcode=${barcode}&product_category=${productCategory}`);
        http.send();
    }

    function requireBarcode(service, barcode){
        const barcodeControl = document.getElementById(barcode);
        if(service.value == '23') barcodeControl.required = true;
        else barcodeControl.required = false;
    }

    function getServiceType(pid, stid = 0){
        const http = new XMLHttpRequest();
        http.open("GET", `ajax/get_services.php?pid=${pid}&stid=${stid}`);
        http.send();
        http.onload = function(){
            document.getElementById("service_type").innerHTML = http.responseText;
        }
    }

    function checkPincode(input){
        let pincode = input.value;
        let city_id = <?php echo isset($_SESSION['type_center']) ? $_SESSION['sc_city'] : 0 ?>;

        if(input.value.length == 6){
            const obj = new XMLHttpRequest();
            obj.open("GET", `ajax/check_pincode_center.php?pincode=${pincode}&cityId=${city_id}`, false);
            obj.send();

            if(obj.status == 200){
                let res = obj.responseText;
                if(res < 1){
                    input.value = "";
                    input.focus();
                    document.getElementById("demo").innerHTML = "Please enter the valid pincode for your center !";
                } else {
                    document.getElementById("demo").innerHTML = "";
                }
            } else {
                document.getElementById("demo").innerHTML = "";
            }
        }
    }

    document.addEventListener("alpine:init", () => {
        let todayDate = new Date();
        let formattedToday = todayDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).split('/').join('-')

        Alpine.data("cmplnDate", () => ({
            date2: '<?php echo isset($mode) ? date("d-m-Y", strtotime($data['date'])) : date("d-m-Y") ?>',
            init() {
                flatpickr(document.getElementById('complaint_date'), {
                    dateFormat: 'd-m-Y',
                    minDate: formattedToday,
                    defaultDate: this.date2,
                    minDate: "today",
                })
            }
        }));

        Alpine.data("complaintTime", () => ({
            <?php if (!isset($mode)) { ?>
                    time: todayDate.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
            <?php } ?>
            init() {
                flatpickr(document.getElementById('complaint_time'), {
                    defaultDate: '<?php echo isset($mode) ? $data['time'] : date("h:i a") ?>',
                    noCalendar: true,
                    enableTime: true,
                    dateFormat: 'h:i K'
                });
            }
        }));
    });

    function showPosition(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        const mapLocation = `${latitude},${longitude}`;
        document.getElementById('map_location').value = mapLocation;
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        getLocation();
    });
</script>

<?php
if (isset($mode) && $mode == 'edit') {
    echo "<script>
        const pid = document.getElementById('product_category').value;
        const stid =" . json_encode($data['service_type']) . ";
        console.log(pid, stid);
        getServiceType(pid, stid);
    </script>";
}
?>

<?php
include "footer.php";
?>
