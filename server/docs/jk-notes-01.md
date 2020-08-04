Why are all these items/locations listed like this? As opposed to a general narrative description which includes key items that can be further investigated? @DC

To give people something to start with, lead them on a bit. if we're targeting ppl that have never played a text adventure before
we can remove them, or limit them, or detail them on a help
also put there for my debugging. something like the notebook should be explained, maybe in help is OK tho

>> removed buttons, just left 1 for first task

```
  - name: cell
    state: default
    states:
      - name: default
        short: You are in an inmate’s bedroom.
        imageUrl: story-asylum.wiki/rooms/cell.jpg
        buttons:
          - door | x door
          - sink | x sink
          - desk | x desk
          - wall | x wall
          - notebook | x notes
          - wardrobe | x wardrobe
      - name: task1
        imageUrl: story-asylum.wiki/rooms/cell-1.jpg
      - name: task2
        imageUrl: story-asylum.wiki/rooms/cell-2.jpg
      - name: task3
        imageUrl: story-asylum.wiki/rooms/cell-3.jpg
      - name: task4
        imageUrl: story-asylum.wiki/rooms/cell-4.jpg
```



- Handle, soap, robe, shoes (should be sandals) shouldn’t be listed and visible. They are discoverable upon looking at other items/locations (wardrobe, pillow,

yeah, i need to add a 'hidden' property/variable.

---
Are the buttons meant to be a quick nav to those items/descriptions?

right now they're linked to `x [item]`
there isn't really navigation as this is all in one 'room'

---
> Task1

how did you know about this? maybe cos i mentioned it. but this isn't for end users, its just for debugging.
currently the script is like this:

```

      # TRIGER 1 - get dressed
      - match: task1
        then:
          reply: Before you can move, a voice crackles over a hidden speaker in the room.
            _“To proceed to breakfast, please follow your morning routine.
            Remember, every good boy dresses sharply.”_
          setProps:
            - notes.state = task1
            - room.state = task1

      # TRIGER 2 - do exercise
      - match: task2
        then:
          reply: The top bulb in a column of four has come on, now glowing a bright green above the others.
            The same voice crackles over the speaker. _“That’s a good boy, Jack. Now remember, exercise makes the man. Just as many times as there are legs in the room.”_
          setProps:
            - notes.state = task2
            - room.state = task2

      # TRIGGER #3 - get washed
      - match: task3
        then:
          reply: The second in the column of five green lightbulbs lights up.
            The invisible speaker crackles. _“Well done, young Jack. You’re fit as a fiddle. And now it’s time for all good boys to scrub away those mean, nasty germs. Let’s not be careless, now. Follow proper procedure.”_
          setProps:
            - notes.state = task3
            - room.state = task3

      # TRIGGER #4 - color puzzle
      - match: task4
        then:
          reply: The third green light in the column above the sink turns on.
            The voice is encouraging this time. “Jack, my boy, you’re a wonderful lad.
            Limber and loose and clean as a goose. And dressed up so nicely to boot!
          # imageUrl: xxx
          buttons:
            - Ask about my real clothes | realclothes
          setProps:
            - notes.state = task4
            - room.state = task4
```

so eg if user types `task1` (match)
it will set the room & notes to that state.
currently I don't have any code to prevent other actions being completed in order, but could add that.

----

Search desk
Close drawer

can add these. at the moment i have synonyms for commands and objects separately.
      - name: desk
        called: drawer|desk|squat desk

---

look chair
sit desk


You shouldn’t be able to get the soap without discovering it by look pillow. Same for handle, robe, and sandals

> Without the first voice guiding the first task upon entering the room, the players won’t understand the conceit or guided tasks. The voice should be the first thing at the beginning of entering the room

so that's like 'task1' above?

Look closet
Just bathrobe no sandals


Close closet
Close door
Close wardrobe

Look handle

Look light

Wash hands
Look under bed

---
how to handle lists of items?


If we aren’t using a general description of the room, I wouldn’t use the list here





poem:
Delete the boldface, brackets, and parentheses.., these were just to indicate the solution


The handle is "missing’



------

john knauss  5:26 PM
Use handle

cbg2APP  5:26 PM
Use the handle where?

john knauss  5:27 PM
Sink

cbg2APP  5:27 PM
I don't understand Sink

-------

Use handle with sink

turn handle


---

you try to use the handle on the sink

... but nothing happens.


Now you can turn the handle > "The sink is now useable." Would be better

---
>>
Just your face? That doesn't seem to follow our procedure

john knauss  5:31 PM
The voice crackles out, "Follow proper procedure, Jack. Michael has told you how."


Use soap with sink


remove commas
Wash hands, neck, ears, face



