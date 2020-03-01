# GraphGame
A web game about graphs, nodes, and whatever else I decide to jam into an HMTL5 canvas.

## The Basics
This game is (currently) about creating networks of structures (currently just farms) that generate currency.

Each struct is represented by a circle on a grid, and connections between structs are represented by lines between the structs.

## Controls
This game is primarily mouse driven, though there are some hotkeys available.

The action which will be performed when left clicking is indicated by the buttons on the right panel of the screen.

A left click on the grid will perform one of the following actions:

* Perform a `Query` operation
  * When querying, you can either click on a struct, or on an empty tile.
    * If you click on a struct, a panel will appear / be updated in the top left of the screen. This panel will provide information related to the struct clicked on. A red square will appear around the struct being queried. Connections related to the struct will be highlight. See [`connections`](#Connection) for more details.
    * If you click on an empty tile and a struct is currently being queried, the query panel will disappear.
* Perform a `Struct` operation
  * If you click on an empty tile, a new [`farm`](#Farm) will be created (more structs to come in later versions).
  * If you click on a tile with a struct in it, you can drag to another struct to create a [`connection`](#Connection). Tiles within range of the struct will be highlighted orange.
* `Delete` a struct
  * If you click on a struct, it will be permanently deleted, and leave the tile empty.

Additionally, left clicks can interact with some UI elements, such as collasping the `Message Log`, or selecting the action using the right panel.

The middle and middle mouse buttons allow you to click and drag the grid.

The scroll wheel allows you to zoom in and out.
w
Current hotkeys are as follows:
* `Space` will center the camera on the point `0,0` (the starting position)
* `Q` will select the `Query` action
* `W` will select the `Struct` action
* `E` will select the `Delete` action

## Structs
All major interactions on the grid occur between structs.

All structs have the following properties in common: 
* A single position in the grid
* A status (currently either `BUILDING` or `ACTIVE`)
* A maximum range for outbound [`connections`](#Connection)
* A seperate maximum number of inbound and outbound connections
* Some non-negative amount of currency

When a struct is first created, it starts in a status of `BUILDING`. It will appear as an empty circle. A `BUILDING` struct requires a particular amount of currency to be transferred to it via [`connections`](#Connection) to enter an `ACTIVE` state. The amount required to build a struct can be seen in the query panel. When a struct is being built, it will fill up with green in proportion to it's build process. When a struct is `ACTIVE`, it will be filled with blue.

### <a name="Connection"> Connections
A connection is a directed edge between two structs (bidirectional or undirected edges are not allowed). Only one direct connection may exist between two structs.

Connections are represented by grey lines between structs. The direction of a connection is indicated by small red lines that move along the connection in realtime.

Every second, a struct will transfer 1 unit of currency along all outbound connections, if it can afford to transfer 1 unit for each connection it has (ie; a struct with 3 outbound connections must have 3 units of currency to transfer any).

When querying a struct, all connections related to the queried struct will be coloured as follows:
* all ancestors will be coloured blue
* all children will be coloured yellow
* all structs in a cycle with the struct will be coloured green
* connections with no relation to the struct will remain grey.

### <a name="CommandNode"> Command Node
In the current build of the game, the game starts with a special struct called the Command Node. It starts with a status of `ACTIVE`, and generates currency immediately. Command nodes cannot currently be constructed. 

### <a name="Farm"></a>Farms
Farms are currently the only struct which can be constructed by the player. The output of a farm can be viewed when querying it.

Farms generate currency over time, in proportion to much it contributes to tending to the tiles around it. Generally speaking, each tile in the range of a farm generates `(range - distance) / range` for that farm. Each tile can only produce up to one unit of currency per second, so if multiple farms are in range of a tile which would produce more than 1 unit of currency per second, that 1 unit of currency is split amongst all the farms in proportion to their productive work done to the tile.
