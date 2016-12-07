<?php 

    include('lib/phpqrcode/qrlib.php');
    $url = $_GET['url'];
     
    QRcode::png($url);