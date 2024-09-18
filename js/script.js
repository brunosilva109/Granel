// Função para alterar o plano de fundo
function changeBackground() {
    const select = document.getElementById('backgroundSelect');
    const selectedValue = select.value;

    // Alterar a cor de fundo com base na seleção
    switch(selectedValue) {
        case 'blue':
            document.body.style.backgroundColor = '#007BFF';
            break;
        case 'green':
            document.body.style.backgroundColor = '#28A745';
            break;
        case 'red':
            document.body.style.backgroundColor = '#DC3545';
            break;
        default:
            document.body.style.backgroundColor = '#f0f0f0';
            break;
    }
}
