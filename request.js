
async function createTicket () {
    const fixedAmount = 100000;
    const response = await fetch(`http://localhost:3000/generar-cupon?valor=${fixedAmount}`, {
        method: "POST"
    });
    const { qrCode, couponCode } = await response.json();
    document.getElementById("qrCoupon").src = qrCode;
    document.getElementById("couponCode").textContent = couponCode;
    document.getElementById("descargaQR").style = "display: block;";
    console.log({ response });
}

async function canjarTicketFromCode() {
    const codigo = document.getElementById("inputCode").value;
    const response = await fetch(`http://localhost:3000/redimir-cupon`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({
            codigo
        })
    })
    const { mensaje } = await response.json();
    document.getElementById("responseChange").style = "color: red;";
    document.getElementById("responseChange").textContent = mensaje;
}

function descargarImagen() {
    var a = document.createElement('a');
    a.href = document.getElementById("qrCoupon").src;
    a.download = "cupon.png";
    document.body.appendChild(a);
    a.click();document.body.removeChild(a);
}

document.getElementById("createTicket").addEventListener("click", createTicket);
document.getElementById("canjarTicketCodigo").addEventListener("click", canjarTicketFromCode);
document.getElementById("descargaQR").addEventListener("click", descargarImagen);


const scanner = new Html5QrcodeScanner('reader', {
    qrbox: {
        width: 250,
        height: 300
    },
    fps: 20
})

async function success(result){
    console.log(result);
    const response = await fetch(`http://localhost:3000/redimir-cupon`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({
            codigo: result
        })
    })
    const { mensaje } = await response.json();
    scanner.clear();
    document.getElementById("responseFromImage").style = "color: red;";
    document.getElementById("responseFromImage").textContent = mensaje;
    scanner.render(success, error)

}
function error(){}

scanner.render(success, error)