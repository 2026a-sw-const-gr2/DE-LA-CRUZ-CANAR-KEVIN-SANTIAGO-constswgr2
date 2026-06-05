function serializarMetadata(metadata) {
  if (metadata === undefined || metadata === null) {
    return undefined;
  }

  if (typeof metadata === 'string') {
    return metadata;
  }

  try {
    return JSON.stringify(metadata);
  } catch (error) {
    return String(metadata);
  }
}

function registrar(nivel, mensaje, metadata) {
  const entrada = {
    timestamp: new Date().toISOString(),
    level: nivel,
    message: String(mensaje),
  };

  const metadataSerializada = serializarMetadata(metadata);

  if (metadataSerializada !== undefined) {
    entrada.metadata = metadata;
  }

  const salida = JSON.stringify(entrada);

  if (nivel === 'ERROR') {
    console.error(salida);
    return;
  }

  if (nivel === 'WARN') {
    console.warn(salida);
    return;
  }

  console.log(salida);
}

const logger = {
  info(mensaje, metadata) {
    registrar('INFO', mensaje, metadata);
  },
  warn(mensaje, metadata) {
    registrar('WARN', mensaje, metadata);
  },
  error(mensaje, metadata) {
    registrar('ERROR', mensaje, metadata);
  },
};

module.exports = {
  logger,
};