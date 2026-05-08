/**
 * Route Instructions Generator - Generador de instrucciones paso a paso
 */

class RouteInstructionsGenerator {
  constructor() {
    this.instructions = [];
    this.routePath = null;
  }

  /**
   * Genera instrucciones desde una ruta
   */
  generateInstructions(routePath, startPoint, endPoint) {
    this.routePath = routePath;
    this.instructions = [];

    if (!routePath || routePath.length < 2) {
      return this.instructions;
    }

    // Dividir la ruta en segmentos
    const segments = this.createSegments(routePath);

    // Generar instrucciones para cada segmento
    segments.forEach((segment, index) => {
      const instruction = this.createInstruction(segment, index, segments.length);
      if (instruction) {
        this.instructions.push(instruction);
      }
    });

    return this.instructions;
  }

  /**
   * Crea segmentos de la ruta
   */
  createSegments(routePath) {
    const segments = [];
    const minSegmentDistance = 20; // Distancia mínima en metros entre puntos de instrucción

    let currentSegment = [routePath[0]];
    let segmentDistance = 0;

    for (let i = 1; i < routePath.length; i++) {
      const point = routePath[i];
      const distance = this.calculateDistance(
        currentSegment[currentSegment.length - 1][0],
        currentSegment[currentSegment.length - 1][1],
        point[0],
        point[1]
      );

      segmentDistance += distance;

      if (segmentDistance >= minSegmentDistance) {
        currentSegment.push(point);
        segments.push(currentSegment);
        currentSegment = [point];
        segmentDistance = 0;
      } else {
        currentSegment.push(point);
      }
    }

    // Agregar el último segmento
    if (currentSegment.length > 1) {
      segments.push(currentSegment);
    }

    return segments;
  }

  /**
   * Crea una instrucción desde un segmento
   */
  createInstruction(segment, index, totalSegments) {
    if (segment.length < 2) return null;

    const startPoint = segment[0];
    const endPoint = segment[segment.length - 1];

    // Calcular distancia del segmento
    let distance = 0;
    for (let i = 0; i < segment.length - 1; i++) {
      distance += this.calculateDistance(
        segment[i][0],
        segment[i][1],
        segment[i + 1][0],
        segment[i + 1][1]
      );
    }

    // Determinar dirección
    let direction = 'straight';
    if (index > 0) {
      const prevSegment = this.routePath[index - 1];
      direction = this.determineDirection(prevSegment, startPoint, endPoint);
    }

    // Crear texto de instrucción
    let text = '';
    if (index === 0) {
      text = `Comienza en esta ubicación`;
    } else if (index === totalSegments - 1) {
      text = `Llega a tu destino`;
      direction = 'destination';
    } else {
      text = this.getDirectionText(direction);
    }

    return {
      index: index,
      text: text,
      direction: direction,
      distance: distance,
      lat: endPoint[0],
      lng: endPoint[1],
      segment: segment
    };
  }

  /**
   * Determina la dirección del giro
   */
  determineDirection(prevPoint, currentPoint, nextPoint) {
    const bearing1 = this.calculateBearing(prevPoint[0], prevPoint[1], currentPoint[0], currentPoint[1]);
    const bearing2 = this.calculateBearing(currentPoint[0], currentPoint[1], nextPoint[0], nextPoint[1]);

    const diff = (bearing2 - bearing1 + 360) % 360;

    if (diff < 30 || diff > 330) {
      return 'straight';
    } else if (diff < 90) {
      return 'slight-right';
    } else if (diff < 150) {
      return 'right';
    } else if (diff < 210) {
      return 'sharp-right';
    } else if (diff < 270) {
      return 'u-turn';
    } else if (diff < 330) {
      return 'sharp-left';
    } else if (diff < 270) {
      return 'left';
    } else {
      return 'slight-left';
    }
  }

  /**
   * Obtiene el texto de la dirección
   */
  getDirectionText(direction) {
    const directionTexts = {
      'straight': 'Continúa recto',
      'slight-left': 'Gira ligeramente a la izquierda',
      'left': 'Gira a la izquierda',
      'sharp-left': 'Gira fuertemente a la izquierda',
      'slight-right': 'Gira ligeramente a la derecha',
      'right': 'Gira a la derecha',
      'sharp-right': 'Gira fuertemente a la derecha',
      'u-turn': 'Realiza un giro en U',
      'destination': 'Llegaste a tu destino'
    };

    return directionTexts[direction] || 'Continúa';
  }

  /**
   * Calcula el rumbo entre dos puntos
   */
  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  /**
   * Calcula la distancia entre dos puntos
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calcula la distancia total de la ruta
   */
  calculateTotalDistance(routePath) {
    let totalDistance = 0;
    for (let i = 0; i < routePath.length - 1; i++) {
      totalDistance += this.calculateDistance(
        routePath[i][0],
        routePath[i][1],
        routePath[i + 1][0],
        routePath[i + 1][1]
      );
    }
    return totalDistance;
  }

  /**
   * Calcula el tiempo estimado de la ruta (asumiendo 1.4 m/s de velocidad promedio)
   */
  calculateEstimatedTime(routePath) {
    const totalDistance = this.calculateTotalDistance(routePath);
    const averageSpeed = 1.4; // metros por segundo (aproximadamente 5 km/h)
    return totalDistance / averageSpeed;
  }

  /**
   * Obtiene las instrucciones generadas
   */
  getInstructions() {
    return this.instructions;
  }

  /**
   * Obtiene la instrucción en un índice específico
   */
  getInstructionAt(index) {
    return this.instructions[index] || null;
  }

  /**
   * Obtiene la siguiente instrucción desde una posición
   */
  getNextInstruction(currentIndex) {
    return this.instructions[currentIndex + 1] || null;
  }

  /**
   * Obtiene la instrucción anterior desde una posición
   */
  getPreviousInstruction(currentIndex) {
    return this.instructions[currentIndex - 1] || null;
  }
}

// Instancia global
let routeInstructionsGenerator;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  routeInstructionsGenerator = new RouteInstructionsGenerator();
});
