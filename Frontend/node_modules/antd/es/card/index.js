"use client";

import InternalCard from './Card';
import CardGrid from './CardGrid';
import CardMeta from './CardMeta';
const Card = InternalCard;
Card.Grid = CardGrid;
Card.Meta = CardMeta;
export default Card;