// Creamos una instancia de socket.io desde el lado del cliente ahora:
const socket = io();

// Obtenemos el nombre del usuario desde la variable global definida en Handlebars
const user = `${window.user.firstName} ${window.user.lastName}`;

const chatBox = document.getElementById('chatBox');

// Listener para enviar mensajes
chatBox.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    if (chatBox.value.trim().length > 0) {
      // Enviamos el mensaje junto con el nombre del usuario autenticado
      socket.emit('message', { user: user, message: chatBox.value });
      chatBox.value = '';
    }
  }
});

// Listener de mensajes:
socket.on('messagesLogs', (data) => {
  const log = document.getElementById('messagesLogs');
  log.innerHTML = ''; // Limpiar el contenedor antes de renderizar nuevos mensajes

  data.forEach((message) => {
    // Crear el contenedor del mensaje
    const messageElement = document.createElement('div');
    messageElement.classList.add('flex', 'items-start', 'space-x-4', 'mb-4');

    // Avatar genérico para todos los usuarios
    const avatarElement = document.createElement('div');
    avatarElement.classList.add(
      'w-10',
      'h-10',
      'rounded-full',
      'bg-gray-100',
      'flex',
      'items-center',
      'justify-center'
    );
    avatarElement.textContent = '🤖';

    // Contenedor del mensaje con el texto
    const messageContent = document.createElement('div');
    messageContent.classList.add(
      'bg-blue-100',
      'text-blue-800',
      'px-4',
      'py-2',
      'rounded-lg',
      'max-w-xs'
    );

    // Nombre del usuario en negrita
    const userName = document.createElement('strong');
    userName.classList.add('block', 'text-sm', 'font-semibold');
    userName.textContent = message.user;

    // El texto del mensaje
    const messageText = document.createElement('p');
    messageText.classList.add('text-sm');
    messageText.textContent = message.message;

    // Agregar el nombre de usuario y el mensaje al contenedor de contenido del mensaje
    messageContent.appendChild(userName);
    messageContent.appendChild(messageText);

    // Agregar el avatar y el contenido del mensaje al contenedor del mensaje
    messageElement.appendChild(avatarElement);
    messageElement.appendChild(messageContent);

    // Añadir el mensaje al contenedor de logs
    log.appendChild(messageElement);
  });

  // Auto-scroll hacia abajo para ver el último mensaje
  log.scrollTop = log.scrollHeight;
});
