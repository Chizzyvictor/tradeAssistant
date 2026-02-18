/**
 * Main JavaScript file for Inventory Management System
 */

$(document).ready(function() {
    
    // Initialize DataTables on all tables with class 'data-table'
    if ($('.data-table').length) {
        $('.data-table').DataTable({
            "pageLength": 10,
            "ordering": true,
            "searching": true,
            "responsive": true,
            "language": {
                "search": "Search:",
                "lengthMenu": "Show _MENU_ entries",
                "info": "Showing _START_ to _END_ of _TOTAL_ entries",
                "paginate": {
                    "first": "First",
                    "last": "Last",
                    "next": "Next",
                    "previous": "Previous"
                }
            }
        });
    }

    // Form validation
    $('.needs-validation').on('submit', function(e) {
        if (!this.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
        }
        $(this).addClass('was-validated');
    });

    // Confirm delete actions
    $('.delete-confirm').on('click', function(e) {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            e.preventDefault();
            return false;
        }
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 5000);

    // Number input validation (prevent negative numbers)
    $('input[type="number"]').on('input', function() {
        var min = $(this).attr('min');
        var value = $(this).val();
        if (min !== undefined && parseFloat(value) < parseFloat(min)) {
            $(this).val(min);
        }
    });

    // Format currency inputs
    $('.currency-input').on('blur', function() {
        var value = parseFloat($(this).val());
        if (!isNaN(value)) {
            $(this).val(value.toFixed(2));
        }
    });

    // Stock movement form - update stock preview
    $('#movement_type, #quantity').on('change', function() {
        updateStockPreview();
    });

    function updateStockPreview() {
        var currentStock = parseInt($('#current_stock').val()) || 0;
        var quantity = parseInt($('#quantity').val()) || 0;
        var movementType = $('#movement_type').val();
        var newStock = currentStock;

        if (movementType === 'in') {
            newStock = currentStock + quantity;
        } else if (movementType === 'out') {
            newStock = currentStock - quantity;
        } else if (movementType === 'adjustment') {
            newStock = quantity;
        }

        $('#stock_preview').html(
            '<strong>Current Stock:</strong> ' + currentStock + 
            ' → <strong>New Stock:</strong> ' + newStock
        );

        if (newStock < 0) {
            $('#stock_preview').addClass('text-danger').removeClass('text-success');
        } else {
            $('#stock_preview').addClass('text-success').removeClass('text-danger');
        }
    }

    // AJAX form submission
    $('.ajax-form').on('submit', function(e) {
        e.preventDefault();
        
        var form = $(this);
        var url = form.attr('action');
        var method = form.attr('method') || 'POST';
        var formData = form.serialize();

        $.ajax({
            url: url,
            method: method,
            data: formData,
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    showAlert('success', response.message);
                    if (response.redirect) {
                        setTimeout(function() {
                            window.location.href = response.redirect;
                        }, 1500);
                    }
                } else {
                    showAlert('danger', response.message);
                }
            },
            error: function() {
                showAlert('danger', 'An error occurred. Please try again.');
            }
        });
    });

    // Show alert function
    function showAlert(type, message) {
        var alertHtml = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">' +
            message +
            '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
            '</div>';
        
        $('#alert-container').html(alertHtml);
        
        setTimeout(function() {
            $('.alert').fadeOut('slow');
        }, 5000);
    }

    // Print functionality
    $('.btn-print').on('click', function() {
        window.print();
    });

    // Export to CSV functionality
    $('.btn-export-csv').on('click', function() {
        var table = $(this).data('table');
        exportTableToCSV(table);
    });

    function exportTableToCSV(tableId) {
        var csv = [];
        var rows = document.querySelectorAll('#' + tableId + ' tr');

        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll('td, th');
            
            for (var j = 0; j < cols.length - 1; j++) { // Skip last column (actions)
                row.push(cols[j].innerText);
            }
            
            csv.push(row.join(','));
        }

        downloadCSV(csv.join('\n'), tableId + '.csv');
    }

    function downloadCSV(csv, filename) {
        var csvFile;
        var downloadLink;

        csvFile = new Blob([csv], {type: 'text/csv'});
        downloadLink = document.createElement('a');
        downloadLink.download = filename;
        downloadLink.href = window.URL.createObjectURL(csvFile);
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
    }

    // Real-time search for products
    $('#product_search').on('keyup', function() {
        var value = $(this).val().toLowerCase();
        $('#products_table tbody tr').filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });

    // Toggle password visibility
    $('.toggle-password').on('click', function() {
        var input = $($(this).data('target'));
        var icon = $(this).find('i');
        
        if (input.attr('type') === 'password') {
            input.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            input.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });

});
