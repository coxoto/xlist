<?php
    header("content-type:text/html;charset=utf-8");  
    //$input = $_GET["input"];
    $input = file_get_contents("php://input");;
    $m = $_GET["m"];
    $filename=dirname(__FILE__)."\db.txt";
    if($m == "get"){
        echo file_get_contents($filename);
    }else if($m == "post"){
        file_put_contents($filename,$input);
        echo "{\"res\":0}";

    }
