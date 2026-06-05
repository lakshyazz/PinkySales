<?php
include "header.php";
?>

<div class='p-6' x-data='exportTable'>
    <div class="panel mt-2">
        <div class='flex items-center justify-between mb-3'>
            <h1 class='text-primary text-2xl font-semibold'>Complaint / Demo</h1>
            <div class="flex flex-wrap items-center">
                <button type="button" class="p-2 btn btn-primary btn-sm m-1"
                    onclick="location.href='add_complaint_demo.php'">
                    <i class="ri-add-line mr-1"></i> Add Product
                </button>
                <button type="button" class="p-2 btn btn-primary btn-sm m-1" @click="printTable">
                    <i class="ri-printer-line mr-1"></i> PRINT
                </button>
                <button type="button" class="p-2 btn btn-primary btn-sm m-1" @click="exportTable('csv')">
                    <i class="ri-file-line mr-1"></i> CSV
                </button>
            </div>
        </div>
        <table id="myTable" class="table-hover whitespace-nowrap"></table>
    </div>
</div>

<!-- script -->

<script>
function getActions(id, number) {
    return `<ul class="flex items-center justify-center gap-4">
        <li>
            <a href="javascript:viewRecord(${id}, 'add_complaint_demo.php')" class='text-xl' x-tooltip="View">
                <i class="ri-eye-line text-primary"></i>
            </a>
        </li>
        <li>
            <a href="javascript:updateRecord(${id}, 'add_complaint_demo.php')" class='text-xl' x-tooltip="Edit">
                <i class="ri-pencil-line text text-success"></i>
            </a>
        </li>
        <li>
            <a href="javascript:;" class='text-xl' x-tooltip="Delete" @click="showAlert(${id}, '${number}')">
                <i class="ri-delete-bin-line text-danger"></i>
            </a>
        </li>
    </ul>`
}

document.addEventListener('alpine:init', () => {
    Alpine.data('exportTable', () => ({
        datatable: null,
        init() {
            console.log('Initalizing datatable')
            this.datatable = new simpleDatatables.DataTable('#myTable', {
                data: {
                    headings: ['Sr.No.', 'Complaint No.', 'Customer name', 'Contact',
                        'Pincode',
                        'Service Type', 'Product Category', 'Date Time',
                        'Warranty-Status', 'Call Status', 'Source', 'Action'
                    ],
                    data: [
                        <?php
                                if (isset($_SESSION['type_center']) && $_SESSION['type_center']) {
                                    $city_id = $_SESSION['sc_city'];
                                    $stmt = $obj->con1->prepare("SELECT c1.*, ca.status, s1.name AS service_type, p1.name AS product_category, CONCAT(c1.fname, ' ', c1.lname) AS customer_name, CONCAT(c1.date, ' ', c1.time) AS datetime FROM customer_reg c1, service_type s1, product_category p1, call_allocation ca WHERE c1.warranty!=2 AND c1.service_type!=16 AND c1.service_type=s1.id AND c1.complaint_no=ca.complaint_no AND c1.product_category=p1.id AND c1.area=? order by c1.id DESC");
                                    $stmt->bind_param("i", $city_id);
                                    $stmt->execute();
                                    $Resp = $stmt->get_result();
                                    $stmt->close();

                                    $id = 1;
                                } else {
                                    $stmt = $obj->con1->prepare("SELECT c1.*, ca.status, s1.name AS service_type, p1.name AS product_category, CONCAT(c1.fname, ' ', c1.lname) AS customer_name, CONCAT(c1.date, ' ', c1.time) AS datetime FROM customer_reg c1, service_type s1, product_category p1, call_allocation ca WHERE c1.warranty!=2 AND c1.service_type!=16 AND c1.service_type=s1.id and c1.complaint_no=ca.complaint_no AND c1.product_category=p1.id ORDER BY c1.id DESC");
                                    $stmt->execute();
                                    $Resp = $stmt->get_result();
                                    $id = 1;
                                }
                                while ($row = ((is_object($Resp) && method_exists($Resp, "fetch_array")) ? $Resp->fetch_array() : null)) {
                            ?>[
                            <?php echo $id ?>,
                            '<?php echo $row['complaint_no'] ?>',
                            '<?php echo $row['customer_name'] ?>',
                            '<?php echo $row['contact'] ?>',
                            '<?php echo $row['zipcode'] ?>',
                            '<?php echo $row['service_type'] ?>',
                            '<?php echo $row['product_category'] ?>',
                            '<?php 
                                        $date = date_create($row['datetime']);
                                        echo date_format($date, "d-m-Y h:i A");
                                     ?>',
                            `<span class="badge badge-outline-<?php echo $row['warranty'] == 1 ? 'success' : ($row['warranty'] == 3 ? 'secondary' : 'danger') ?>">
                                        <?php echo $row['warranty'] == 1 ? 'In-Warranty' : ($row['warranty'] == 3 ? 'N / A' : 'Out-of-Warranty') ?>
                                    </span>`,
                            `<span class="badge badge-outline-<?php
                                        switch ($row["status"]) {
                                            case 'new':
                                                echo 'secondary';
                                                break;
                                            case 'allocated':
                                                echo 'warning';
                                                break;
                                            case 'closed':
                                                echo 'success';
                                                break;
                                            case 'cancelled':
                                                echo 'danger';
                                                break;
                                            case 'pending':
                                                echo 'dark';
                                                break;
                                            default:
                                                echo 'primary';
                                                break;
                                        }
                                    ?>">
                                        <?php echo ucfirst($row['status']) ?>
                                    </span>`,
                            `<span class="badge badge-outline-<?php echo $row['source'] == 'web' ? 'secondary' : 'danger' ?>">
                                        <?php echo ucfirst($row['source']) ?>
                                    </span>`,
                            getActions('<?php echo $row['id'] ?>',
                                '<?php echo $row['complaint_no'] ?>')
                        ],
                        <?php
                                $id++;
                            }
                            ?>
                    ],
                },
                perPage: 10,
                perPageSelect: [10, 20, 30, 50, 100],
                columns: [{
                    select: 0,
                    sort: 'asc',
                }, ],
                firstLast: true,
                firstText: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180"> <path d="M13 19L7 12L13 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path opacity="0.5" d="M16.9998 19L10.9998 12L16.9998 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
                lastText: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180"> <path d="M11 19L17 12L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path opacity="0.5" d="M6.99976 19L12.9998 12L6.99976 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
                prevText: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180"> <path d="M15 5L9 12L15 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
                nextText: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4.5 h-4.5 rtl:rotate-180"> <path d="M9 5L15 12L9 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
                labels: {
                    perPage: '{select}',
                },
                layout: {
                    top: '{search}',
                    bottom: '{info}{select}{pager}',
                },
            });
        },

        exportTable(eType) {
            var data = {
                type: eType,
                filename: 'complaint_demo',
                download: true,
            };

            if (data.type === 'csv') {
                data.lineDelimiter = '\n';
                data.columnDelimiter = ';';
            }
            this.datatable.export(data);
        },

        printTable() {
            this.datatable.print();
        },

        formatDate(date) {
            if (date) {
                const dt = new Date(date);
                const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() +
                    1;
                const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
                return day + '/' + month + '/' + dt.getFullYear();
            }
            return '';
        },
    }));
})

function showAlert(id, number) {
    new window.Swal({
        title: 'Are you sure?',
        text: `You want to delete Call :- ${number}!`,
        showCancelButton: true,
        confirmButtonText: 'Delete',
        padding: '2em',
    }).then((result) => {
        console.log(result)
        if (result.isConfirmed) {
            var loc = "complaint_demo.php?flg=del&n_complaintid=" + id;
            window.location = loc;
        }
    });
}
</script>

<?php
include "footer.php";
?>
